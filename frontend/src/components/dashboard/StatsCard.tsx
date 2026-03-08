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
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3e8ff] text-[#46178f]">
          <Icon size={20} />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-4xl font-extrabold text-gray-900">{value}</h2>

        {trend ? (
          <p className="flex items-center gap-1 text-sm">
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600",
              )}
            >
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500">{trend.label}</span>
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold">
              i
            </span>
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
