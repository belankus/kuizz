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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { apiFetch, getAccessToken } from "@/lib/auth";
import { CollectionItemCard } from "@/components/collections/CollectionItemCard";

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

export default function QuizesComponent({ apiUrl }: { apiUrl: string }) {
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

    const menuActions = [
      {
        label: "Edit",
        onClick: () => router.push(`/dashboard/quiz/${quiz.id}`),
      },
      {
        label: "Export Excel",
        onClick: () => {
          window.location.href = `${apiUrl}/quiz/${quiz.id}/export`;
        },
      },
      {
        label: quiz.isFavorite ? "Unfavorite" : "Favorite",
        onClick: () => handleToggleFavorite(quiz.id, quiz.isFavorite),
      },
      {
        label: "Delete",
        onClick: () => {
          setDeleteId(quiz.id);
          setOpenModal(true);
        },
        destructive: true,
      },
    ];

    return (
      <CollectionItemCard
        key={quiz.id}
        id={quiz.id}
        title={quiz.title}
        type={isPublished ? "PUBLISHED" : "DRAFT"}
        questionsCount={quiz.questions.length}
        updatedAt={timeAgo}
        primaryActionLabel={isPublished ? "Host Live" : "Continue Editing"}
        onPrimaryAction={() =>
          isPublished
            ? handleStartGame(quiz.id)
            : router.push(`/dashboard/quiz/${quiz.id}`)
        }
        secondaryActionLabel={null} // Don't show secondary button inside My Quizzes (cleaner)
        menuActions={menuActions}
        onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
      />
    );
  };

  const filterTabs = ["All Quizzes", "Favorites", "Shared with me", "Drafts"];

  return (
    <div className="pb-24">
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-black text-gray-900 dark:text-white/90">
          My Library
        </h1>
        <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400">
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
                  ? "bg-[#111827] text-white shadow-md shadow-gray-900/10 dark:bg-white dark:text-gray-900"
                  : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
          <span className="mr-2">Sort by:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center rounded-lg px-3 py-1.5 font-bold text-gray-900 transition-colors outline-none hover:bg-gray-100 dark:text-white/90 dark:hover:bg-gray-800">
                {activeSort}{" "}
                <ChevronDown size={16} className="ml-1 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 dark:border-gray-800 dark:bg-gray-900"
            >
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
          className="group dark:hover:border-brand-500/50 flex h-[380px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-gray-200 bg-white/50 p-8 transition-all hover:border-[#46178f]/30 hover:bg-white hover:shadow-sm dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-gray-800"
        >
          <div className="dark:text-brand-400 dark:group-hover:bg-brand-500 mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#46178f] shadow-sm transition-all group-hover:scale-110 group-hover:bg-[#46178f] group-hover:text-white dark:bg-gray-800 dark:group-hover:text-white">
            <Plus size={32} />
          </div>
          <h3 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white/90">
            Create New
            <br />
            Quiz
          </h3>
          <p className="max-w-[150px] text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            Start from scratch or use AI generator
          </p>
        </div>

        {/* Existing Quizzes */}
        {sortedQuizzes.map((quiz) => renderQuizCard(quiz))}
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
