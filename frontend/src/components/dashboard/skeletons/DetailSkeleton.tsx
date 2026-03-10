import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#121212]">
            <Skeleton className="mb-6 h-6 w-32" />
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#121212]">
            <Skeleton className="mb-6 h-6 w-48" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-gray-50 p-3 dark:border-white/5"
                >
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#121212]">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
