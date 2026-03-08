import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Gamepad2 } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = <Gamepad2 className="h-8 w-8 text-gray-400" />,
  title,
  description,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          variant="secondary"
          className="rounded-full bg-[#f3e8ff] px-6 text-[#46178f] hover:bg-[#e9d5ff]"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
