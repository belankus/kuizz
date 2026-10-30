"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Clock,
  Heart,
  MoreVertical,
  Play,
  Plus,
  Table2,
  Trash2,
  Edit2,
  Share2,
  UserX,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { apiFetch, getAccessToken } from "@/lib/auth";
import { AvatarModel } from "@/types";
import { useTranslations } from "next-intl";

type QuizVisibility = "PRIVATE" | "SHARED" | "PUBLIC";

type QuizAccess = {
  id: string;
  quizId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  visibility?: QuizVisibility;
  updatedAt: string;
  isFavorite: boolean;
  ownerId?: string;
  sharedWith?: QuizAccess[];
  _count: {
    gameSessions: number;
  };
  questions: { id: string }[];
};

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: AvatarModel | null;
  createdAt: string;
};
export default function QuizesComponent({ apiUrl }: { apiUrl: string }) {
  const t = useTranslations("QuizLibrary");
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Quizzes");
  const [activeSort, setActiveSort] = useState("Most Recent");

  // State pour la modale de partage
  const [shareQuizTarget, setShareQuizTarget] = useState<Quiz | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
    document.title = `${t("pageTitle")} | Kuizz`;
  }, [t]);

  const fetchQuizzes = () => {
    apiFetch(`/quiz`)
      .then((res) => res.json())
      .then((data) => setQuizzes(data));
  };


  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiFetch("/users/me");
      if (!res.ok) throw new Error();
      const data: UserProfile = await res.json();
      setUserId(data.id);
    } catch {
      toast.error(t("loadProfileFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDelete = async () => {
    if (!deleteId || isDeleting) return;

    try {
      setIsDeleting(true);

      const quiz = quizzes.find((q) => q.id === deleteId);
      if (!quiz) {
        toast.error(t("quizNotFound"));
        return;
      }

      const isSharedWithMe = Boolean(userId && quiz.ownerId && quiz.ownerId !== userId);

      if (isSharedWithMe) {
        // Retirer mon propre accès au quiz partagé
        const res = await apiFetch(`/quiz/${deleteId}/share/${userId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error();

        toast.success(t("accessRevoked"));
      } else {
        // Supprimer définitivement le quiz si je suis le propriétaire
        const res = await apiFetch(`/quiz/${deleteId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error();

        toast.success(t("quizDeleted"));
      }

      // Mise à jour de l'état local et fermeture de la modale
      setQuizzes((prev) => prev.filter((q) => q.id !== deleteId));
      setOpenModal(false);
      setDeleteId(null);
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartGame = (quizId: string) => {
    if (loading) return;

    const token = getAccessToken();
    if(!token) {
      console.error("No access token found. Please log in.");
      return;
    }

    setLoading(true);

    if (!socket.connected) {
      console.warn("Socket not connected. Attempting to connect...");
      socket.connect();
    }

    socket.once("host_registered", (data) => {
      localStorage.setItem("hostToken", data.hostToken);
      localStorage.setItem("roomCode", data.roomCode);
      localStorage.setItem("hostRoom", data.roomCode);

      router.push(`/game/${data.roomCode}`);
    });

    socket.once("connect_error", () => {
      setLoading(false);
      console.error("Socket connection error. Please try again.");
    });

    socket.emit("create_game", {
      quizId,
      token
    });
  };

  const handleToggleFavorite = async (
    quizId: string,
    currentStatus: boolean,
  ) => {
    try {
      // Optimistic update
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId ? { ...q, isFavorite: !currentStatus } : q,
        ),
      );

      const res = await apiFetch(`/quiz/${quizId}/favorite`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error();
    } catch {
      toast.error(t("favoriteUpdateFailed"));
      // Revert on error
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId ? { ...q, isFavorite: currentStatus } : q,
        ),
      );
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareQuizTarget || !shareEmail.trim() || isSharing) return;

    try {
      setIsSharing(true);
      const res = await apiFetch(`/quiz/${shareQuizTarget.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t("shareFailed"));
      }

      toast.success(t("shareSuccess"));
      setShareEmail("");
      fetchQuizzes();
      setShareQuizTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("shareFailed"));
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnshareUser = async (quizId: string, targetUserId: string) => {
    try {
      const res = await apiFetch(`/quiz/${quizId}/share/${targetUserId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success(t("accessRevoked"));

      setShareQuizTarget((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sharedWith: prev.sharedWith?.filter((s) => s.userId !== targetUserId),
        };
      });

      fetchQuizzes();
    } catch {
      toast.error(t("revokeFailed"));
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    if (activeFilter === "Favorites") return q.isFavorite;
    if (activeFilter === "Drafts") return q.status === "DRAFT";
    if (activeFilter === "Shared with me") {
      return userId && q.ownerId && q.ownerId !== userId;
    }
    return true;
  });

  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    if (activeSort === "Most Recent") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (activeSort === "Oldest") {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    if (activeSort === "Alphabetical (A-Z)") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const renderQuizCard = (quiz: Quiz) => {
    // Determine visual treatment based on status
    const isPublished = quiz.status === "PUBLISHED";
    const isSharedWithMe = userId && quiz.ownerId && quiz.ownerId !== userId;

    let statusBadgeClass = "";
    let cardGraphicClass = "";

    if (isSharedWithMe) {
      statusBadgeClass = "bg-[#FBBF24] text-white tracking-wider";
      cardGraphicClass = "bg-[#E6F3EF]";
    } else if (isPublished) {
      statusBadgeClass = "bg-[#2ECC71] text-white tracking-wider";
      cardGraphicClass = "bg-[#E6F3EF]";
    } else {
      statusBadgeClass = "bg-[#8E95A4] text-white tracking-wider";
      cardGraphicClass = "bg-[#E5E7EB]";
    }

    // Format date relative
    const updatedDate = new Date(quiz.updatedAt);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60),
    );

    let timeAgo = t("justNow");
    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      timeAgo = t("daysAgo", { count: days });
    } else if (diffHours > 0) {
      timeAgo = t("hoursAgo", { count: diffHours });
    } else {
      const diffMins = Math.floor(
        (now.getTime() - updatedDate.getTime()) / (1000 * 60),
      );
      if (diffMins > 0) timeAgo = t("minutesAgo", { count: diffMins });
    }

    return (
      <div
        key={quiz.id}
        className="flex h-[380px] flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        {/* Top Graphic Area */}
        <div
          className={`relative h-44 ${cardGraphicClass} w-full overflow-hidden p-4`}
        >
          {/* Abstract graphics based on status */}
          {isPublished && (
            <svg
              className="absolute -right-10 -bottom-10 h-[150%] w-[150%] text-[#a8e6cf] opacity-50"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,72.4,41.2C63.4,53.2,50.8,62.7,37.1,69.5C23.4,76.3,8.6,80.3,-6.1,79.8C-20.8,79.3,-35.4,74.3,-48.5,66.1C-61.6,57.9,-73.2,46.3,-80.6,32.3C-88,18.3,-91.2,1.9,-87.3,-13.1C-83.3,-28.1,-72.2,-41.8,-58.9,-51.2C-45.6,-60.7,-30.1,-66,-15.5,-73.1C-1,-80.1,13.4,-89,28.5,-87C43.6,-85.1,30.6,-83.6,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
          )}

          {/* Top Badges inner */}
          <div className="relative z-10 flex items-start justify-between">
            <span
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${statusBadgeClass}`}
            >
              {isSharedWithMe
                ? t("sharedWithMe")
                : isPublished
                  ? t("published")
                  : t("draft")}
            </span>
            {!isSharedWithMe && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(quiz.id, quiz.isFavorite);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors hover:bg-black/30 ${quiz.isFavorite
                  ? "bg-red-500/90 text-white"
                  : "bg-black/20 text-white"
                  }`}
              >
                <Heart
                  size={16}
                  className={quiz.isFavorite ? "fill-current" : ""}
                />
              </button>)}
          </div>

          {/* Questions absolute badge */}
          <div className="absolute right-4 bottom-4 rounded-md bg-[#4B5563] px-3 py-1 text-xs font-bold text-white opacity-90 shadow-sm">
            {quiz.questions.length} Qs
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="line-clamp-2 pr-2 text-[18px] leading-tight font-bold text-gray-900">
              {quiz.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="-mr-2 rounded-full p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> {t("edit")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => setShareQuizTarget(quiz)}
                >
                  <Share2 className="mr-2 h-4 w-4 text-[#46178f]" /> {t("share")}
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Table2 className="mr-2 h-4 w-4" /> {t("export")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onSelect={() => {
                          window.location.href = `${apiUrl}/quiz/${quiz.id}/export`;
                        }}
                      >
                        {t("excelExport")}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onSelect={() => {
                    setDeleteId(quiz.id);
                    setOpenModal(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mb-2">
            <h4 className="text-sm text-gray-600">{quiz.description}</h4>
          </div>
          <div className="mt-auto mb-6 flex items-center gap-4 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{t("updated", { time: timeAgo })}</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <Play size={14} className="fill-gray-400" />
              <span>
                {t("plays", { count: quiz._count?.gameSessions || 0 })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto grid grid-cols-2 gap-3">
            {isPublished ? (
              <>
                <Button
                  onClick={() => handleStartGame(quiz.id)}
                  className="h-10 w-full rounded-lg bg-[#46178f] font-bold text-white shadow-sm hover:bg-[#3b127a]"
                >
                  {t("hostLive")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                  className="h-10 w-full rounded-lg border-gray-200 bg-white font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  {t("edit")}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                className="col-span-2 h-10 w-full rounded-lg border-dashed border-gray-300 font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                {t("continueEditingDraft")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filterTabs = [
    { value: "All Quizzes", label: t("allQuizzes") },
    { value: "Favorites", label: t("favorites") },
    { value: "Shared with me", label: t("sharedWithMe") },
    { value: "Drafts", label: t("drafts") },
  ];
  const isSharedWithMe = userId && deleteId && quizzes.find((q) => q.id === deleteId)?.ownerId !== userId;
  return (
    <div className="pb-24">
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-black text-gray-900">
          {t("myLibrary")}
        </h1>
        <p className="text-[15px] font-medium text-gray-500">
          {t("libraryDescription")}
        </p>
      </div>

      {/* Filters & Sort */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${activeFilter === tab.value
                ? "bg-[#111827] text-white shadow-md shadow-gray-900/10"
                : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center text-sm font-medium text-gray-500">
          <span className="mr-2">{t("sortBy")}:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center rounded-lg px-3 py-1.5 font-bold text-gray-900 transition-colors outline-none hover:bg-gray-100">
                {t(`sort.${activeSort}`)}{" "}
                <ChevronDown size={16} className="ml-1 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {["Most Recent", "Oldest", "Alphabetical (A-Z)"].map(
                (sortOption) => (
                  <DropdownMenuItem
                    key={sortOption}
                    onClick={() => setActiveSort(sortOption)}
                    className={
                      activeSort === sortOption
                        ? "font-bold text-[#46178f]"
                        : ""
                    }
                  >
                    {t(`sort.${sortOption}`)}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grids */}
      <div className="xxl:grid-cols-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Create New Card (Always visible) */}
        <div
          onClick={() => router.push("/dashboard/create")}
          className="group flex h-[380px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-gray-200 bg-white/50 p-8 transition-all hover:border-[#46178f]/30 hover:bg-white hover:shadow-sm"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#46178f] shadow-sm transition-all group-hover:scale-110 group-hover:bg-[#46178f] group-hover:text-white">
            <Plus size={32} />
          </div>
          <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
            {t("createNew")}
            <br />
            {t("quiz")}
          </h3>
          <p className="max-w-[150px] text-center text-sm font-medium text-gray-500">
            {t("startFromScratch")}
          </p>
        </div>

        {/* Existing Quizzes */}
        {sortedQuizzes.map((quiz) => renderQuizCard(quiz))}
      </div>

      {/* Floating Action Button */}
      <div className="fixed right-8 bottom-8 z-50">
        <button
          onClick={() => router.push("/dashboard/create")}
          className="flex items-center gap-2 rounded-full bg-[#0060FF] px-6 py-4 font-bold text-white shadow-lg shadow-[#0060FF]/30 transition-all hover:-translate-y-1 hover:bg-[#0050d2] hover:shadow-xl"
        >
          <Plus size={20} /> {t("createQuiz")}
        </button>
      </div>

      {/* Modal Partage de Quiz */}
      <Dialog
        open={Boolean(shareQuizTarget)}
        onOpenChange={(open: boolean) => !open && setShareQuizTarget(null)}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t("shareTitle", { title: shareQuizTarget?.title || "" })}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {t("shareDescription")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleShareSubmit} className="mt-2 space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={shareEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShareEmail(e.target.value)}
                className="rounded-xl border-gray-200"
                required
              />
              <Button
                type="submit"
                disabled={isSharing}
                className="rounded-xl bg-[#46178f] font-bold text-white hover:bg-[#3b127a]"
              >
                <UserPlus size={16} className="mr-1.5" />
                {isSharing ? t("sharing") : t("invite")}
              </Button>
            </div>
          </form>

          <div className="mt-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              {t("peopleWithAccess")}
            </h4>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {shareQuizTarget?.sharedWith && shareQuizTarget.sharedWith.length > 0 ? (
                shareQuizTarget.sharedWith.map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-sm"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-gray-800">
                        {access.user?.name || access.user?.email || t("user")}
                      </p>
                      {access.user?.name && (
                        <p className="text-xs text-gray-400">{access.user.email}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        shareQuizTarget &&
                        handleUnshareUser(shareQuizTarget.id, access.userId)
                      }
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <UserX size={16} />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="py-2 text-center text-sm text-gray-400">
                  {t("notShared")}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Suppression */}
      <AlertDialog open={openModal} onOpenChange={setOpenModal}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSharedWithMe ? t("quitQuizConfirm") : t("deleteQuizConfirm")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              {
                isSharedWithMe
                  ? t("quitQuizDescription")
                  : t("deleteQuizDescription")
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              className="rounded-xl border-gray-200 px-6 font-bold text-gray-600 hover:bg-gray-100"
              onClick={() => {
                setDeleteId(null);
                setOpenModal(false);
              }}
            >
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 px-6 font-bold text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting
                ? isSharedWithMe
                  ? t("revoking")
                  : t("deleting")
                : isSharedWithMe
                  ? t("quitQuiz")
                  : t("deleteQuiz")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}