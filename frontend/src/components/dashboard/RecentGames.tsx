"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { RecentGamesSkeleton } from "./skeletons/OverviewSkeleton";
import { handleError } from "@/lib/handle-error";
import { handleApiError } from "@/lib/api-error-handler";

// Simple relative time formatter to avoid extra dependencies
function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

interface RecentGame {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  totalPlayers: number;
}

export default function RecentGames() {
  const [games, setGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecentGames() {
      try {
        const res = await apiFetch("/dashboard/summary");
        await handleApiError(res);
        const data = await res.json();
        setGames(data.recentGames || []);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentGames();
  }, []);

  const hasGames = games.length > 0;

  if (loading) {
    return <RecentGamesSkeleton />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white/90">
          Recent Games
        </h2>
        <Link
          href="/dashboard/quizes"
          className="text-sm font-semibold text-[#e54d1f] hover:underline dark:text-orange-400"
        >
          View all
        </Link>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        {hasGames ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-6 transition-colors hover:bg-gray-50 dark:hover:bg-white/2"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white/90">
                    {game.title || "Untitled Game"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {game.totalPlayers || 0} players •{" "}
                    {formatRelativeTime(new Date(game.createdAt))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      game.status === "COMPLETED"
                        ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400"
                    }`}
                  >
                    {game.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <EmptyState
              title="No games yet"
              description="Create your first quiz to start hosting games."
              actionText="Create Quiz"
              onAction={() => router.push("/dashboard/quizes?create=true")}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
