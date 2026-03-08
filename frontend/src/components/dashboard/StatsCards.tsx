import React from "react";
import StatsCard from "./StatsCard";
import { FileText, PlayCircle, Users, Target } from "lucide-react";

export default function StatsCards() {
  const statsData = [
    {
      title: "Total Quizzes",
      value: "0",
      description: "Insufficient data",
      icon: FileText,
      trend: {
        value: 0,
        label: "vs last month",
        isPositive: true,
      },
    },
    {
      title: "Games Hosted",
      value: "0",
      description: "Host your first game to see activity",
      icon: PlayCircle,
    },
    {
      title: "Total Players",
      value: "0",
      description: "Players will appear after your first game",
      icon: Users,
    },
    {
      title: "Global Accuracy",
      value: "0%",
      description: "Insufficient data",
      icon: Target,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
