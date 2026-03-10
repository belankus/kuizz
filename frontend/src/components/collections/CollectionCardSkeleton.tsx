import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function CollectionCardSkeleton() {
  return (
    <div className="relative flex h-[340px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900/50 dark:ring-gray-800">
      {/* Cover Gradient Placeholder */}
      <Skeleton className="h-[120px] w-full rounded-none" />

      <div className="flex h-full flex-1 flex-col p-5">
        {/* Title Placeholder */}
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-2 h-6 w-1/2" />

        {/* Description Placeholder */}
        <div className="mb-4 flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Footer Meta Placeholder */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>

        {/* Bottom Actions Placeholder */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  );
}
