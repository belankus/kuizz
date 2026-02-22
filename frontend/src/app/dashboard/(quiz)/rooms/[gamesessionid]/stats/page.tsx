"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/auth";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  Users,
  Target,
  Trophy,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type StatsData = {
  session: {
    title: string;
    createdAt: string;
    status: string;
    totalQuestions: number;
    finishedAt: string | null;
  };
  stats: {
    totalPlayers: number;
    averageScore: number;
    accuracyRate: number;
  };
  topPlayers: { id: string; nickname: string; score: number }[];
  questionsAnalytics: {
    questionIndex: number;
    correct: number;
    incorrect: number;
  }[];
  playersDetail: {
    id: string;
    nickname: string;
    totalScore: number;
    answers: {
      questionIndex: number;
      isCorrect: boolean;
      responseTime: number;
      score: number;
    }[];
  }[];
};

export default function GameStatsPage() {
  const { gamesessionid } = useParams() as { gamesessionid: string };
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch(`/game-session/${gamesessionid}/stats`);
        if (!res.ok) throw new Error("Failed to load statistics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error("Could not load game session statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [gamesessionid]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-gray-500">Loading Game Statistics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-red-500">Game session not found.</div>
      </div>
    );
  }

  const { session, stats, topPlayers, questionsAnalytics, playersDetail } =
    data;

  // Chart Configuration: Questions Accuracy
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    colors: ["#10B981", "#EF4444"], // green, red
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: ["#fff"] },
    xaxis: {
      categories: questionsAnalytics.map((_, i) => `Q${i + 1}`),
      title: { text: "Questions" },
    },
    yaxis: {
      title: { text: "Number of Answers" },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} answers`,
      },
    },
    fill: { opacity: 1 },
    legend: { position: "top", horizontalAlign: "left" },
  };

  const chartSeries = [
    {
      name: "Correct",
      data: questionsAnalytics.map((q) => q.correct),
    },
    {
      name: "Incorrect",
      data: questionsAnalytics.map((q) => q.incorrect),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => router.push("/dashboard/rooms")}
          className="text-sm text-indigo-600 hover:underline"
        >
          &larr; Back to History
        </button>
      </div>

      <PageBreadcrumb pageTitle={`${session.title} - Session Stats`} />

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Participants</p>
              <h3 className="flex items-center gap-2 text-2xl font-bold">
                {stats.totalPlayers}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-900/50 dark:text-green-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Overall Accuracy
              </p>
              <h3 className="flex items-center gap-2 text-2xl font-bold">
                {stats.accuracyRate}%
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-yellow-100 p-3 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <h3 className="flex items-center gap-2 text-2xl font-bold">
                {stats.averageScore}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Questions</p>
              <h3 className="flex items-center gap-2 text-2xl font-bold">
                {session.totalQuestions}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <ComponentCard title="Questions Accuracy">
            <div className="h-80 w-full">
              {typeof window !== "undefined" && (
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="bar"
                  height={320}
                />
              )}
            </div>
          </ComponentCard>
        </div>

        {/* Top Players section */}
        <div className="space-y-6 lg:col-span-1">
          <ComponentCard title="Top Performers">
            {topPlayers.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No players joined this session.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {topPlayers.map((player, idx) => (
                  <li
                    key={player.id}
                    className="flex items-center justify-between rounded-lg px-2 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          idx === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : idx === 1
                              ? "bg-gray-200 text-gray-600"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {player.nickname}
                      </span>
                    </div>
                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                      {player.score} pts
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </ComponentCard>

          <ComponentCard title="Session Info">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge
                  className={
                    session.status === "FINISHED"
                      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                  }
                >
                  {session.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Started At:</span>
                <span className="font-medium">
                  {new Date(session.createdAt).toLocaleString()}
                </span>
              </div>
              {session.finishedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Finished At:</span>
                  <span className="font-medium">
                    {new Date(session.finishedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </ComponentCard>
        </div>
      </div>

      {/* Player Results */}
      <div className="mt-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
            Player Results
          </h3>
          {playersDetail.length === 0 ? (
            <p className="text-sm text-gray-500">No player data available.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-6 py-4 font-medium text-gray-500"
                      >
                        Nickname
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-4 font-medium text-gray-500"
                      >
                        Correctness
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-4 font-medium text-gray-500"
                      >
                        Total Score
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-4 text-right font-medium text-gray-500"
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {playersDetail.map((player) => (
                      <TableRow
                        key={player.id}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                              {player.nickname.charAt(0).toUpperCase()}
                            </div>
                            {player.nickname}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-gray-500 dark:text-gray-400">
                            {player.answers.filter((a) => a.isCorrect).length}/
                            {session.totalQuestions} correct
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                            {player.totalScore} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/dashboard/rooms/${gamesessionid}/stats/${player.id}`}
                            >
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
