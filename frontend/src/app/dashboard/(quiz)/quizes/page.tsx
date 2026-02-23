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
  DropdownMenuGroup,
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
  questions: { id: string }[];
};

// Mock statuses: "LIVE READY", "SELF-PACED", "DRAFT", "LIVE"
type QuizStatus = "LIVE READY" | "SELF-PACED" | "DRAFT" | "LIVE";

const getMockStatus = (id: string): QuizStatus => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const statuses: QuizStatus[] = ["LIVE READY", "SELF-PACED", "DRAFT", "LIVE"];
  return statuses[hash % statuses.length];
};

export default function BasicTables() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Quizzes");

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

  const renderQuizCard = (quiz: Quiz) => {
    const status = getMockStatus(quiz.id);

    // Status visual mapping
    let statusBg = "";
    let statusText = "";
    let statusBadgeClass = "";
    let cardGraphicClass = "";

    switch (status) {
      case "LIVE READY":
        statusBg = "bg-[#2ECC71]";
        statusText = "text-white";
        statusBadgeClass = "bg-[#2ECC71] text-white tracking-wider";
        cardGraphicClass = "bg-[#FFF2E5]";
        break;
      case "SELF-PACED":
        statusBg = "bg-[#2D8CFF]";
        statusText = "text-white";
        statusBadgeClass = "bg-[#2D8CFF] text-white tracking-wider";
        cardGraphicClass = "bg-[#E6F3EF]";
        break;
      case "DRAFT":
        statusBg = "bg-[#8E95A4]";
        statusText = "text-white";
        statusBadgeClass = "bg-[#8E95A4] text-white tracking-wider";
        cardGraphicClass = "bg-[#E5E7EB]";
        break;
      case "LIVE":
        statusBg = "bg-[#A55Eea]";
        statusText = "text-white";
        statusBadgeClass = "bg-[#A55Eea] text-white tracking-wider";
        cardGraphicClass = "bg-[#F4F5F7]";
        break;
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
          {status === "LIVE READY" && (
            <svg
              className="absolute -top-10 -left-10 h-[180%] w-[180%] text-white opacity-60"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M47.7,-57.2C59.5,-45.5,65.2,-27.1,64.3,-10.8C63.4,5.4,55.9,19.6,47.1,33.1C38.3,46.6,28.2,59.3,14.6,63.9C0.9,68.4,-16.3,64.8,-30.4,57C-44.5,49.2,-55.6,37.3,-62.4,22.7C-69.2,8.1,-71.8,-9.2,-66.3,-23.4C-60.9,-37.6,-47.5,-48.8,-33.5,-60.1C-19.4,-71.4,-4.8,-82.9,6.7,-81.2C18.2,-79.6,36,-68.9,47.7,-57.2Z"
                transform="translate(100 100)"
              />
            </svg>
          )}
          {status === "SELF-PACED" && (
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
              {status}
            </span>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/30">
              <Heart size={16} />
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

          <div className="mt-auto mb-6 flex items-center gap-4 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span className="max-w-[80px] truncate">Updated 2h ago</span>{" "}
              {/* Mocked time */}
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <Play size={14} className="fill-gray-400" />
              <span>{Math.floor(Math.random() * 500)} plays</span>{" "}
              {/* Mocked plays */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto grid grid-cols-2 gap-3">
            {status === "LIVE READY" || status === "LIVE" ? (
              <>
                <Button
                  onClick={() => handleStartGame(quiz.id)}
                  className="h-10 w-full rounded-lg bg-[#46178f] font-bold text-white shadow-sm hover:bg-[#3b127a]"
                >
                  Host
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                  className="h-10 w-full rounded-lg border-gray-200 bg-white font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Edit
                </Button>
              </>
            ) : status === "SELF-PACED" ? (
              <>
                <Button className="h-10 w-full rounded-lg bg-[#0060FF] font-bold text-white shadow-sm hover:bg-[#0050d2]">
                  Assign
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
                Continue Editing
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
          <button className="flex items-center rounded-lg px-3 py-1.5 font-bold text-gray-900 transition-colors hover:bg-gray-100">
            Most Recent <ChevronDown size={16} className="ml-1 opacity-70" />
          </button>
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
        {quizzes.map((quiz) => renderQuizCard(quiz))}
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
