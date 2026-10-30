"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
  History,
  Trophy,
  Users,
  Target,
  ArrowUpRightIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";
import { toast } from "sonner";
import Link from "next/link";
import ComponentCard from "@/components/common/ComponentCard";
import {
  DashboardMetricsType,
  GameHistoryModel,
  GameSessionModel,
} from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";

export default function ReportsPage() {
  const t = useTranslations("Reports");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Tab name
  useEffect(() => {
    document.title = "Reports & History | Kuizz";
  }, []);

  // Tabs State
  const [activeTab, setActiveTab] = useState<"HOSTED" | "PLAYED">("HOSTED");

  // Hosted Games Params
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Summary Query
  const { data: summary, isLoading: loadingSummary } =
    useQuery<DashboardMetricsType>({
      queryKey: ["dashboard-summary"],
      queryFn: async () => {
        const res = await apiFetch(`/dashboard/summary`);
        if (!res.ok) throw new Error("Failed to load summary");
        return res.json();
      },
    });

  // Hosted Games Query
  const { data: hostedData, isLoading: loadingHosted } = useQuery<{
    data: GameSessionModel[];
    meta: { totalPages: number };
  }>({
    queryKey: ["hosted-sessions", page, debouncedSearch],
    queryFn: async () => {
      const res = await apiFetch(
        `/game-session?page=${page}&limit=${limit}&search=${debouncedSearch}`,
      );
      if (!res.ok) throw new Error("Failed to load sessions");
      return res.json();
    },
    placeholderData: keepPreviousData,
    enabled: activeTab === "HOSTED",
  });

  const hostedSessions = hostedData?.data || [];
  const totalPages = hostedData?.meta?.totalPages || 1;

  // Played Games Query
  const {
    data: playedHistory = [],
    isLoading: loadingPlayed,
    error: playedErrorObj,
  } = useQuery<GameHistoryModel[]>({
    queryKey: ["played-history"],
    queryFn: async () => {
      const res = await apiFetch("/users/me/history");
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: activeTab === "PLAYED" || !summary, // Load history if tab is active or as initial load
  });

  const playedError =
    playedErrorObj instanceof Error ? playedErrorObj.message : null;

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
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["hosted-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    } catch {
      toast.error("Failed to delete game session");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-black text-gray-900">
          {t("reportsAndHistory")}
        </h1>
        <p className="text-[15px] font-medium text-gray-500">
          {t("reportsSublabel")}
        </p>
      </div>

      {/* Summary Statistics Cards */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Quizzes */}
        <div className="flex flex-col justify-between rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#46178f]">
            <Gamepad2 size={24} />
          </div>
          <div>
            <p className="mb-1 text-sm font-bold tracking-wider text-gray-500 uppercase">
              {t("totalQuizzes")}
            </p>
            {loadingSummary ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="text-3xl font-black text-gray-900">
                {summary?.metrics?.totalQuizzes || 0}
              </h3>
            )}
          </div>
        </div>

        {/* Total Hosted */}
        <div className="flex flex-col justify-between rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F3EF] text-[#2ECC71]">
            <Trophy size={24} />
          </div>
          <div>
            <p className="mb-1 text-sm font-bold tracking-wider text-gray-500 uppercase">
              {t("gamesHosted")}
            </p>
            {loadingSummary ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="text-3xl font-black text-gray-900">
                {summary?.metrics?.totalGamesHosted || 0}
              </h3>
            )}
          </div>
        </div>

        {/* Total Players */}
        <div className="flex flex-col justify-between rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F0FF] text-[#2D8CFF]">
            <Users size={24} />
          </div>
          <div>
            <p className="mb-1 text-sm font-bold tracking-wider text-gray-500 uppercase">
              {t("totalPlayers")}
            </p>
            {loadingSummary ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="text-3xl font-black text-gray-900">
                {summary?.metrics?.totalPlayers || 0}
              </h3>
            )}
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="flex flex-col justify-between rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF2E5] text-[#FF9B26]">
            <Target size={24} />
          </div>
          <div>
            <p className="mb-1 text-sm font-bold tracking-wider text-gray-500 uppercase">
              {t("globalAccuracy")}
            </p>
            {loadingSummary ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="text-3xl font-black text-gray-900">
                {summary?.metrics?.averageAccuracy || 0}%
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("HOSTED")}
          className={`border-b-2 px-6 py-3 text-sm font-bold tracking-wide transition-colors ${
            activeTab === "HOSTED"
              ? "border-[#46178f] text-[#46178f]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("hostedGames")}
        </button>
        <button
          onClick={() => setActiveTab("PLAYED")}
          className={`border-b-2 px-6 py-3 text-sm font-bold tracking-wide transition-colors ${
            activeTab === "PLAYED"
              ? "border-[#46178f] text-[#46178f]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("playedGames")}
        </button>
      </div>

      {/* Hosted Games View */}
      {activeTab === "HOSTED" && (
        <div className="animate-in fade-in zoom-in-95 space-y-6 duration-200">
          <ComponentCard title={t("sessionsHosted")}>
            <div className="mb-4 flex items-center justify-between px-4">
              <input
                type="text"
                placeholder={t("search")}
                className="w-full rounded-full border-transparent bg-gray-50 px-5 py-2.5 text-sm text-gray-900 transition-all outline-none focus:border-gray-200 focus:bg-white focus:ring-4 focus:ring-[#46178f]/5 sm:w-80"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // reset to first page on search
                }}
              />
            </div>

            {loadingHosted ? (
              <div className="py-10 text-center text-gray-500">
                {t("loadingSessions")}
              </div>
            ) : hostedSessions.length === 0 ? (
              <Empty className="m-4 rounded-[20px] border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Gamepad2 />
                  </EmptyMedia>
                  <EmptyTitle>{t("noHostedGames")}</EmptyTitle>
                  <EmptyDescription>
                    {t("haventHosted")}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
                  <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                      <Table>
                        <TableHeader className="border-b border-gray-100 bg-gray-50">
                          <TableRow>
                            <TableCell
                              isHeader
                              className="px-5 py-4 text-start text-xs font-bold tracking-wider text-gray-600 uppercase"
                            >
                              {t("title")}
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-5 py-4 text-start text-xs font-bold tracking-wider text-gray-600 uppercase"
                            >
                              {t("status")}
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-5 py-4 text-start text-xs font-bold tracking-wider text-gray-600 uppercase"
                            >
                              {t("datePlayed")}
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-5 py-4 text-start text-xs font-bold tracking-wider text-gray-600 uppercase"
                            >
                              {t("players")}
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-5 py-4 text-right text-xs font-bold tracking-wider text-gray-600 uppercase"
                            >
                              {t("actions")}
                            </TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100">
                          {hostedSessions.map((session) => (
                            <TableRow
                              key={session.id}
                              className="transition-colors hover:bg-gray-50"
                            >
                              <TableCell className="px-5 py-4 font-bold text-gray-900">
                                {session.title}
                              </TableCell>
                              <TableCell className="px-5 py-4">
                                <Badge
                                  className={`rounded-md px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                    session.status === "FINISHED"
                                      ? "bg-[#E6F3EF] text-[#2ECC71]"
                                      : session.status === "STARTED"
                                        ? "bg-[#FFF2E5] text-[#FF9B26]"
                                        : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {session.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-5 py-4 font-medium text-gray-500">
                                {new Date(
                                  session.createdAt,
                                ).toLocaleDateString()}{" "}
                                <span className="ml-1 text-xs text-gray-400">
                                  {new Date(
                                    session.createdAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </TableCell>
                              <TableCell className="px-5 py-4 font-bold text-gray-700">
                                {session.totalPlayers}
                              </TableCell>
                              <TableCell className="px-5 py-4 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
                                    >
                                      <Ellipsis className="h-5 w-5 text-gray-500" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    side="bottom"
                                    align="end"
                                    className="w-48 rounded-xl"
                                  >
                                    <DropdownMenuGroup>
                                      <DropdownMenuItem
                                        className="font-medium"
                                        onClick={() =>
                                          router.push(
                                            `/dashboard/reports/${session.id}/stats`,
                                          )
                                        }
                                      >
                                        <BarChartBig className="mr-2 h-4 w-4" />
                                        {t("viewStats")}
                                      </DropdownMenuItem>
                                      {(session.status === "WAITING" ||
                                        session.status === "STARTED") &&
                                        session.roomCode && (
                                          <DropdownMenuItem
                                            className="font-medium text-[#46178f]"
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
                                            {t("enterLobby")}
                                          </DropdownMenuItem>
                                        )}
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                      <DropdownMenuItem
                                        className="font-medium text-red-600"
                                        onClick={() => {
                                          setDeleteId(session.id);
                                          setOpenModal(true);
                                        }}
                                      >
                                        <TrashIcon className="mr-2 h-4 w-4" />
                                        {t("delete")}
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
                  <div className="mt-6 flex items-center justify-between px-4">
                    <div className="text-sm font-bold text-gray-500">
                      {t("pageXofY", { current: page, total: totalPages })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg font-bold shadow-sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        {t("previous")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg font-bold shadow-sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      >
                        {t("next")}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </ComponentCard>
        </div>
      )}

      {/* Played Games View */}
      {activeTab === "PLAYED" && (
        <div className="animate-in fade-in zoom-in-95 space-y-6 duration-200">
          <ComponentCard title={t("gamesPlayed")}>
            {loadingPlayed ? (
              <div className="animate-pulse space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-full rounded-xl border border-gray-100 bg-gray-50"
                  />
                ))}
              </div>
            ) : playedError ? (
              <div className="m-4 rounded-xl border-red-200 bg-red-50 p-4 font-medium text-red-600">
                {playedError}
              </div>
            ) : playedHistory.length === 0 ? (
              <Empty className="m-4 rounded-[20px] border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <History />
                  </EmptyMedia>
                  <EmptyTitle>{t("noGameplayHistory")}</EmptyTitle>
                  <EmptyDescription>
                    {t("haventPlayed")}
                  </EmptyDescription>
                </EmptyHeader>
                <Button
                  className="mt-4 rounded-full bg-[#46178f] px-6 font-bold hover:bg-[#3b127a]"
                  asChild
                >
                  <Link href="/join">
                    {t("joinGame")} <ArrowUpRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Empty>
            ) : (
              <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
                <div className="max-w-full overflow-x-auto">
                  <div className="min-w-[800px]">
                    <Table>
                      <TableHeader className="border-b border-gray-100 bg-gray-50">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-5 py-4 text-start text-xs font-bold tracking-wider text-gray-600 uppercase"
                          >
                            {t("title")}
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-4 text-start text-xs font-bold tracking-wider text-gray-600 uppercase"
                          >
                            {t("playedAs")}
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-4 text-start text-xs font-bold tracking-wider text-gray-600 uppercase"
                          >
                            {t("score")}
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-4 text-start text-xs font-bold tracking-wider text-gray-600 uppercase"
                          >
                            {t("date")}
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-4 text-right text-xs font-bold tracking-wider text-gray-600 uppercase"
                          >
                            {t("action")}
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100">
                        {playedHistory.map((record) => (
                          <TableRow
                            key={record.id}
                            className="transition-colors hover:bg-gray-50"
                          >
                            <TableCell className="px-5 py-4">
                              <div className="font-bold text-gray-900">
                                {record.session?.title || "Unknown Quiz"}
                              </div>
                              <div className="mt-1 text-xs font-semibold text-gray-500">
                                {t("totalQuestions", { count: record.session?.totalQuestions })}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 font-bold text-gray-700">
                              {record.nickname}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-lg font-black text-[#46178f]">
                              {record.score.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-5 py-4 font-medium whitespace-nowrap text-gray-500">
                              {new Date(record.joinedAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                              <div className="mt-0.5 text-[11px] font-semibold text-gray-400">
                                {new Date(record.joinedAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg font-bold shadow-sm"
                                asChild
                              >
                                <Link
                                  href={`/dashboard/reports/player-history/${record.id}`}
                                >
                                  {t("viewDetails")}
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </ComponentCard>
        </div>
      )}

      {/* Delete Confirmation Modal for Hosted Game */}
      <AlertDialog open={openModal} onOpenChange={setOpenModal}>
        <AlertDialogContent className="rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 text-red-600">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>{t("deleteSession")}</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-gray-500">
              {t("deletePermanentlyConfirm")}
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
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
