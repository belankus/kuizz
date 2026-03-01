"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiFetch } from "@/lib/auth";
import { Users, Gamepad2, BrainCircuit, Target, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DashboardMetricsType } from "@repo/types";
import { ApexOptions } from "apexcharts";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function Overview() {
  const [data, setData] = useState<DashboardMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const res = await apiFetch("/dashboard/summary");
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard summary");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      toast.error("Failed to load dashboard", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    colors: ["#3b82f6"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: data.gamesPerDay.map((d) => d.date),
      tooltip: { enabled: false },
      labels: {
        style: { colors: "#64748b" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b" },
        formatter: (val: number) => val.toFixed(0),
      },
    },
    grid: { strokeDashArray: 4 },
  };

  const chartSeries = [
    {
      name: "Games Hosted",
      data: data.gamesPerDay.map((d) => d.count),
    },
  ];

  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard Overview" />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="bg-brand-50 text-brand-500 dark:bg-brand-500/10 flex h-11 w-11 items-center justify-center rounded-full">
            <BrainCircuit size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {data.metrics.totalQuizzes}
              </h4>
              <span className="text-sm font-medium text-gray-500">
                Total Quizzes
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
            <Gamepad2 size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {data.metrics.totalGamesHosted}
              </h4>
              <span className="text-sm font-medium text-gray-500">
                Games Hosted
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/10">
            <Users size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {data.metrics.totalPlayers}
              </h4>
              <span className="text-sm font-medium text-gray-500">
                Total Players
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-500/10">
            <Target size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {data.metrics.averageAccuracy}%
              </h4>
              <span className="text-sm font-medium text-gray-500">
                Global Accuracy
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        {/* Chart Column */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-6 xl:col-span-8 dark:border-gray-800 dark:bg-white/3">
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Games Activity (Last 7 Days)
          </h4>
          <div className="h-[300px] w-full">
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={300}
            />
          </div>
        </div>

        {/* Recent Games Table */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-6 xl:col-span-4 dark:border-gray-800 dark:bg-white/3">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Games
            </h4>
            <button
              onClick={() => router.push("/dashboard/reports")}
              className="text-brand-500 hover:text-brand-600 text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            {data.recentGames.length === 0 ? (
              <p className="text-sm text-gray-500">No games hosted yet.</p>
            ) : (
              data.recentGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-white/90">
                      {game.title}
                    </h5>
                    <span className="text-xs text-gray-500">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={
                        game.status === "FINISHED"
                          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : game.status === "STARTED"
                            ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                            : "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                      }
                    >
                      {game.status}
                    </Badge>
                    <span className="text-xs font-medium text-gray-500">
                      {game.totalPlayers} Players
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
