import React from "react";
import { Card } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatsCardProps) {
  return (
    <Card className="flex flex-col justify-between p-6">
      <div className="mb-4 flex items-start justify-between">
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          {title}
        </span>
        <div className="dark:bg-brand-500/20 dark:text-brand-400 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3e8ff] text-[#46178f]">
          <Icon size={20} />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-4xl font-extrabold text-gray-900 dark:text-white/90">
          {value}
        </h2>

        {trend ? (
          <p className="flex items-center gap-1 text-sm">
            <span
              className={cn(
                "font-medium",
                trend.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {trend.label}
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold dark:bg-gray-800 dark:text-gray-300">
              i
            </span>
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
