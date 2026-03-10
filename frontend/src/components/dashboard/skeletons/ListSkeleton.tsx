import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ListSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#121212]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Skeleton className="h-10 max-w-sm flex-1 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>

        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 dark:border-white/5"
            >
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
