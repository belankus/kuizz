"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Ellipsis,
  FolderCode,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type Quiz = {
  id: string;
  title: string;
  questions: { id: string }[];
};

export default function BasicTables() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/quiz")
      .then((res) => res.json())
      .then((data) => setQuizzes(data));
  }, []);

  const handleDelete = async () => {
    if (!deleteId || isDeleting) return;

    try {
      setIsDeleting(true);

      const res = await fetch(`http://localhost:3000/quiz/${deleteId}`, {
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

  return (
    <div>
      <PageBreadcrumb pageTitle="Quizes" />
      <Button onClick={() => router.push("/create")} className="mb-4">
        <PlusIcon className="h-4 w-4" /> Create New Quiz
      </Button>

      {quizzes.length === 0 && <EmptyPlaceholder />}
      <div className="flex w-full flex-wrap justify-start gap-6">
        {quizzes.map((quiz: any, index: number) => (
          <div
            key={index}
            className="flex h-32 w-52 shrink-0 basis-52 flex-col rounded-2xl border bg-white"
          >
            <div className="h-24 border-b">
              <h2 className="pt-2 pb-2 pl-4">{quiz.title}</h2>
            </div>
            <div className="flex items-center justify-between pl-4 text-sm text-gray-500">
              <div>{quiz.questions.length} questions</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-xs">
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => router.push(`/quiz/${quiz.id}`)}
                    >
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ShareIcon />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => {
                        setDeleteId(quiz.id);
                        setOpenModal(true);
                      }}
                    >
                      <TrashIcon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        <AlertDialog open={openModal} onOpenChange={setOpenModal}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this quiz. The played quiz
                statistic will remain.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                variant="outline"
                onClick={() => {
                  setDeleteId(null);
                  setOpenModal(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

const EmptyPlaceholder = () => {
  const router = useRouter();
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCode />
        </EmptyMedia>
        <EmptyTitle>Quiz Empty</EmptyTitle>
        <EmptyDescription>Create a new quiz to get started.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/create")}
        >
          Create Quiz
        </Button>
      </EmptyContent>
    </Empty>
  );
};
