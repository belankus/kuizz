"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { apiFetch } from "@/lib/auth";
import { GamesActivitySkeleton } from "./skeletons/OverviewSkeleton";

export default function GamesActivity() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        await apiFetch("/dashboard/summary");
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) {
    return <GamesActivitySkeleton />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white/90">
          Games Activity
        </h2>
        <div className="flex gap-1">
          <span className="block h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700"></span>
          <span className="block h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700"></span>
        </div>
      </div>

      <Card className="flex min-h-[300px] flex-1 flex-col items-center justify-center p-8">
        <div className="pointer-events-none mb-8 flex h-40 w-full items-end justify-center gap-4 opacity-30 grayscale dark:opacity-20">
          {/* Chart Placeholder Bars */}
          <div
            className="w-12 rounded-t-lg bg-gray-200 dark:bg-gray-700"
            style={{ height: "30%" }}
          ></div>
          <div
            className="w-12 rounded-t-lg bg-gray-200 dark:bg-gray-700"
            style={{ height: "50%" }}
          ></div>
          <div
            className="w-12 rounded-t-lg bg-gray-200 dark:bg-gray-700"
            style={{ height: "20%" }}
          ></div>
          <div
            className="w-12 rounded-t-lg bg-gray-200 dark:bg-gray-700"
            style={{ height: "80%" }}
          ></div>
          <div
            className="w-12 rounded-t-lg bg-gray-200 dark:bg-gray-700"
            style={{ height: "40%" }}
          ></div>
          <div
            className="w-12 rounded-t-lg bg-gray-200 dark:bg-gray-700"
            style={{ height: "60%" }}
          ></div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white/90">
            Activity will appear here
          </h3>
          <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Host your first game to see player engagement and completion rates
            in real-time.
          </p>
          <Link href="/dashboard/quizes">
            <Button
              variant="outline"
              className="dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-500/20 rounded-full border-[#46178f] text-[#46178f] hover:bg-[#f3e8ff]"
            >
              Host Game
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
