"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { History, ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import Link from "next/link";

type GameHistory = {
  id: string;
  sessionId: string;
  nickname: string;
  score: number;
  joinedAt: string;
  session: {
    title: string;
    createdAt: string;
    totalQuestions: number;
  };
};

export default function PlayHistoryPage() {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await apiFetch("/users/me/history");
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Play History</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Track your past game sessions and scores.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full rounded border bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : history.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History />
            </EmptyMedia>
            <EmptyTitle>No Gameplay History</EmptyTitle>
            <EmptyDescription>
              You haven't played any games yet. Join a room and complete a quiz
              to track your score here!
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="link"
            asChild
            className="text-muted-foreground"
            size="sm"
          >
            <a href="/join">
              Join a Game <ArrowUpRightIcon className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Quiz Title</th>
                <th className="px-6 py-4 font-medium">Played As</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 text-right font-medium">Date</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {history.map((record) => (
                <tr
                  key={record.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4 font-medium">
                    {record.session?.title || "Unknown Quiz"}
                    <div className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                      {record.session?.totalQuestions} Questions
                    </div>
                  </td>
                  <td className="px-6 py-4">{record.nickname}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {record.score.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {new Date(record.joinedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    <br />
                    <span className="text-xs opacity-75">
                      {new Date(record.joinedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/history/${record.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
