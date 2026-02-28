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
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { API_URL } from "@/lib/config";
import { apiFetch, getAccessToken } from "@/lib/auth";

type Quiz = {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  isFavorite: boolean;
  _count: {
    gameSessions: number;
  };
  questions: { id: string }[];
};

export default function BasicTables() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Quizzes");
  const [activeSort, setActiveSort] = useState("Most Recent");

  useEffect(() => {
    apiFetch(`/quiz`)
      .then((res) => res.json())
      .then((data) => setQuizzes(data));
  }, []);

  const handleDelete = async () => {
    if (!deleteId || isDeleting) return;

    try {
      setIsDeleting(true);

      const res = await apiFetch(`/quiz/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setQuizzes((prev) => prev.filter((q) => q.id !== deleteId));

      toast.success("Quiz deleted");
      setOpenModal(false);
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete quiz");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartGame = (quizId: string) => {
    if (loading) return;

    setLoading(true);

    if (!socket.connected) {
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
    });

    socket.emit("create_game", {
      quizId,
      token: getAccessToken(),
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
      toast.error("Failed to update favorite status");
      // Revert on error
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId ? { ...q, isFavorite: currentStatus } : q,
        ),
      );
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    if (activeFilter === "Favorites") return q.isFavorite;
    if (activeFilter === "Drafts") return q.status === "DRAFT";
    if (activeFilter === "Shared with me") return false;
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
    let statusBadgeClass = "";
    let cardGraphicClass = "";

    if (isPublished) {
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

    let timeAgo = "Just now";
    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      timeAgo = `${days}d ago`;
    } else if (diffHours > 0) {
      timeAgo = `${diffHours}h ago`;
    } else {
      const diffMins = Math.floor(
        (now.getTime() - updatedDate.getTime()) / (1000 * 60),
      );
      if (diffMins > 0) timeAgo = `${diffMins}m ago`;
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
              {isPublished ? "PUBLISHED" : "DRAFT"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(quiz.id, quiz.isFavorite);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors hover:bg-black/30 ${
                quiz.isFavorite
                  ? "bg-red-500/90 text-white"
                  : "bg-black/20 text-white"
              }`}
            >
              <Heart
                size={16}
                className={quiz.isFavorite ? "fill-current" : ""}
              />
            </button>
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
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Table2 className="mr-2 h-4 w-4" /> Export
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onSelect={() => {
                          window.location.href = `${API_URL}/quiz/${quiz.id}/export`;
                        }}
                      >
                        Excel (.xlsx)
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
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
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
              <span>Updated {timeAgo}</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <Play size={14} className="fill-gray-400" />
              <span>{quiz._count?.gameSessions || 0} plays</span>
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
                  Host Live
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                  className="h-10 w-full rounded-lg border-gray-200 bg-white font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Edit
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                className="col-span-2 h-10 w-full rounded-lg border-dashed border-gray-300 font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Continue Editing (Draft)
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filterTabs = ["All Quizzes", "Favorites", "Shared with me", "Drafts"];

  return (
    <div className="pb-24">
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-black text-gray-900">My Library</h1>
        <p className="text-[15px] font-medium text-gray-500">
          Manage your quizzes, host live games, or assign self-paced challenges.
        </p>
      </div>

      {/* Filters & Sort */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                activeFilter === tab
                  ? "bg-[#111827] text-white shadow-md shadow-gray-900/10"
                  : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center text-sm font-medium text-gray-500">
          <span className="mr-2">Sort by:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center rounded-lg px-3 py-1.5 font-bold text-gray-900 transition-colors outline-none hover:bg-gray-100">
                {activeSort}{" "}
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
                    {sortOption}
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
            Create New
            <br />
            Quiz
          </h3>
          <p className="max-w-[150px] text-center text-sm font-medium text-gray-500">
            Start from scratch or use AI generator
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
          <Plus size={20} /> Create Quiz
        </button>
      </div>

      <AlertDialog open={openModal} onOpenChange={setOpenModal}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              This will permanently delete this quiz. Played quiz statistics
              will remain.
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
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 px-6 font-bold text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
