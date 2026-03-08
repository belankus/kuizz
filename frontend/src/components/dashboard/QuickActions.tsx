import React from "react";
import QuickActionCard from "./QuickActionCard";
import {
  PlusSquare,
  UploadCloud,
  LayoutTemplate,
  BarChart2,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Create Quiz",
      description: "Build from scratch",
      icon: PlusSquare,
      href: "/dashboard/quizes?create=true",
    },
    {
      title: "Import Questions",
      description: "CSV or Excel files",
      icon: UploadCloud,
      href: "/dashboard/import",
    },
    {
      title: "Browse Templates",
      description: "Ready-made quizzes",
      icon: LayoutTemplate,
      href: "/dashboard/collections",
    },
    {
      title: "View Analytics",
      description: "Deep dive performance",
      icon: BarChart2,
      href: "/dashboard/reports",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-gray-900">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  );
}
