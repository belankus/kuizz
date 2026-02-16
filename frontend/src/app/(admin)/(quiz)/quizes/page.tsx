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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  ArrowUpRightIcon,
  Ellipsis,
  FolderCode,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  Table2,
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
        <PlusIcon className="h-4 w-4" /> New Quiz
      </Button>

      {quizzes.length === 0 && <EmptyPlaceholder />}
      <div className="flex w-full flex-wrap justify-start gap-6">
        {quizzes.map((quiz: any, index: number) => (
          <div
            key={index}
            className="flex h-32 w-52 shrink-0 basis-52 flex-col rounded-2xl border bg-white"
          >
            <div className="flex h-24 items-start justify-between gap-2 border-b">
              <h2 className="truncate pt-2 pb-2 pl-4">{quiz.title}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className="mt-2 mr-2"
                  >
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => router.push(`/quiz/${quiz.id}`)}
                    >
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <ShareIcon />
                        Export
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onSelect={() =>
                              router.push(
                                `http://localhost:3000/quiz/${quiz.id}/export`,
                              )
                            }
                          >
                            <Table2 />
                            Excel (.xlsx)
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
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
            <div className="flex items-center justify-start pl-4 text-sm text-gray-500">
              <div>{quiz.questions.length} questions</div>
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
        <EmptyTitle>No Quizzes Yet</EmptyTitle>
        <EmptyDescription>
          You haven't created any quizzes yet. Get started by creating your
          first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button size="sm" onClick={() => router.push("/create")}>
          Create Quiz
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/import")}
        >
          Import Project
        </Button>
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <a href="#">
          Learn More <ArrowUpRightIcon />
        </a>
      </Button>
    </Empty>
  );
};
