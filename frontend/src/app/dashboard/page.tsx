import type { Metadata } from "next";
import React from "react";
import HeroBanner from "@/components/dashboard/HeroBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentGames from "@/components/dashboard/RecentGames";
import GamesActivity from "@/components/dashboard/GamesActivity";

export const metadata: Metadata = {
  title: "Dashboard - Kuizz",
  description: "Dashboard overview for Kuizz.",
};

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-2 pb-10">
      <HeroBanner />
      <StatsCards />
      <QuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentGames />
        <GamesActivity />
      </div>
    </div>
  );
}
