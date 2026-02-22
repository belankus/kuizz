"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Trash2Icon,
  TrashIcon,
  Gamepad2,
  BarChartBig,
  FolderCode,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";
import { toast } from "sonner";
import ComponentCard from "@/components/common/ComponentCard";

type GameSession = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  finishedAt: string | null;
  totalPlayers: number;
  roomCode: string | null;
};

export default function RoomsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/game-session?page=${page}&limit=${limit}&search=${search}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSessions(data.data);
        setTotalPages(data.meta.totalPages);
      }
    } catch {
      toast.error("Failed to load game sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteId || isDeleting) return;

    try {
      setIsDeleting(true);
      const res = await apiFetch(`/game-session/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Game session deleted");
      setOpenModal(false);
      setDeleteId(null);
      fetchSessions();
    } catch {
      toast.error("Failed to delete game session");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Game Sessions History" />

      <div className="space-y-6">
        <ComponentCard title="Played Games">
          <div className="mb-4 flex items-center justify-between px-4">
            <input
              type="text"
              placeholder="Search by title..."
              className="w-64 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // reset to first page on search
              }}
            />
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <EmptyPlaceholder />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="max-w-full overflow-x-auto">
                  <div className="min-w-275.5">
                    <Table>
                      <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-gray-800/50">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-start font-medium text-gray-500"
                          >
                            Title
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-start font-medium text-gray-500"
                          >
                            Status
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-start font-medium text-gray-500"
                          >
                            Date Played
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-start font-medium text-gray-500"
                          >
                            Players
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-right font-medium text-gray-500"
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                        {sessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                              {session.title}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <Badge
                                className={
                                  session.status === "FINISHED"
                                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                    : session.status === "STARTED"
                                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                                      : "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                                }
                              >
                                {session.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500">
                              {new Date(session.createdAt).toLocaleDateString()}{" "}
                              {new Date(session.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500">
                              {session.totalPlayers}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-xs">
                                    <Ellipsis className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="bottom" align="end">
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/rooms/${session.id}/stats`,
                                        )
                                      }
                                    >
                                      <BarChartBig className="mr-2 h-4 w-4" />
                                      Statistics
                                    </DropdownMenuItem>
                                    {(session.status === "WAITING" ||
                                      session.status === "STARTED") &&
                                      session.roomCode && (
                                        <DropdownMenuItem
                                          onSelect={() => {
                                            localStorage.setItem(
                                              "hostRoom",
                                              session.roomCode!,
                                            );
                                            router.push(
                                              `/game/${session.roomCode}`,
                                            );
                                          }}
                                        >
                                          <Gamepad2 className="mr-2 h-4 w-4" />
                                          Enter Lobby
                                        </DropdownMenuItem>
                                      )}
                                  </DropdownMenuGroup>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => {
                                        setDeleteId(session.id);
                                        setOpenModal(true);
                                      }}
                                    >
                                      <TrashIcon className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between px-4">
                  <div className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>

      <AlertDialog open={openModal} onOpenChange={setOpenModal}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Game Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the game session history and all its
              associated player statistics.
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
  );
}

const EmptyPlaceholder = () => {
  return (
    <Empty className="m-4 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Gamepad2 />
        </EmptyMedia>
        <EmptyTitle>No Game Sessions</EmptyTitle>
        <EmptyDescription>
          You haven't hosted any games yet. Start a quiz to see its history
          here!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
