import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function StatsCardsSkeleton() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex h-[160px] flex-col justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#121212]"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-2 h-10 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentGamesSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex flex-1 flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#121212]">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0 dark:border-white/5"
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamesActivitySkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-1">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
      </div>
      <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-[#121212]">
        <div className="mb-8 flex h-40 w-full items-end justify-center gap-4">
          <Skeleton className="h-[30%] w-12 rounded-t-lg" />
          <Skeleton className="h-[50%] w-12 rounded-t-lg" />
          <Skeleton className="h-[20%] w-12 rounded-t-lg" />
          <Skeleton className="h-[80%] w-12 rounded-t-lg" />
          <Skeleton className="h-[40%] w-12 rounded-t-lg" />
          <Skeleton className="h-[60%] w-12 rounded-t-lg" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="mt-4 h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-2 pb-10">
      {/* Hero Banner Skeleton */}
      <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>

      <StatsCardsSkeleton />

      {/* Quick Actions Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-7 w-40" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#121212]"
            >
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div>
                <Skeleton className="mb-1 h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentGamesSkeleton />
        <GamesActivitySkeleton />
      </div>
    </div>
  );
}
