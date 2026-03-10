"use client";
import React, { useEffect, useState } from "react";
import StatsCard from "./StatsCard";
import { FileText, PlayCircle, Users, Target } from "lucide-react";
import { apiFetch } from "@/lib/auth";
import { StatsCardsSkeleton } from "./skeletons/OverviewSkeleton";

interface DashboardStats {
  metrics: {
    totalQuizzes: number;
    totalGamesHosted: number;
    totalPlayers: number;
    averageAccuracy: number;
  };
}

export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiFetch("/dashboard/summary");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statsData = [
    {
      title: "Total Quizzes",
      value: loading ? "..." : stats?.metrics.totalQuizzes.toString() || "0",
      description: loading ? "Loading..." : "Total quizzes created",
      icon: FileText,
    },
    {
      title: "Games Hosted",
      value: loading
        ? "..."
        : stats?.metrics.totalGamesHosted.toString() || "0",
      description: loading ? "Loading..." : "Total games you have hosted",
      icon: PlayCircle,
    },
    {
      title: "Total Players",
      value: loading ? "..." : stats?.metrics.totalPlayers.toString() || "0",
      description: loading ? "Loading..." : "Total players joined your games",
      icon: Users,
    },
    {
      title: "Global Accuracy",
      value: loading ? "..." : `${stats?.metrics.averageAccuracy || 0}%`,
      description: loading ? "Loading..." : "Average player accuracy",
      icon: Target,
    },
  ];

  if (loading) {
    return <StatsCardsSkeleton />;
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
