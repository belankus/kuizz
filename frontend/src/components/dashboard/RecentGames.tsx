"use client";
import React from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RecentGames() {
  const hasGames = false; // Mock state
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Recent Games
        </h2>
        <Link
          href="/dashboard/quizes"
          className="text-sm font-semibold text-[#46178f] hover:underline"
        >
          View all
        </Link>
      </div>

      <Card className="flex flex-1 flex-col items-center justify-center p-8">
        {hasGames ? (
          <div>{/* Game list would go here */}</div>
        ) : (
          <EmptyState
            title="No games yet"
            description="Create your first quiz to start hosting games."
            actionText="Create Quiz"
            onAction={() => router.push("/dashboard/quizes")}
          />
        )}
      </Card>
    </div>
  );
}
