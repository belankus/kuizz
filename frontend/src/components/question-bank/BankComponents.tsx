"use client";

import React from "react";
import {
  Search,
  Filter,
  Plus,
  Clock,
  Database,
  User,
  Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BankCardProps {
  id: string;
  name: string;
  description?: string;
  questionCount: number;
  usageCount: number;
  owner: string;
  lastUpdated: string;
  visibility: "PRIVATE" | "SHARED" | "PUBLIC";
}

export const BankCard: React.FC<BankCardProps> = ({
  name,
  description,
  questionCount,
  usageCount,
  owner,
  lastUpdated,
  visibility,
}) => {
  const router = useRouter();
  return (
    <div className="group flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 transition-all hover:shadow-xl hover:shadow-gray-100">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-all group-hover:bg-orange-600 group-hover:text-white">
          <Database size={24} />
        </div>
        <div className="flex items-center gap-2">
          {visibility === "PUBLIC" && (
            <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold tracking-wider text-green-600 uppercase">
              Public
            </span>
          )}
          {visibility === "SHARED" && (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
              Shared
            </span>
          )}
          <button className="text-gray-300 hover:text-gray-600">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-orange-600">
          {name}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {description || "A collection of curated questions for assessment."}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Questions
          </span>
          <span className="text-sm font-bold text-gray-700">
            {questionCount}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Used In
          </span>
          <span className="text-sm font-bold text-gray-700">
            {usageCount} Quizzes
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 drop-shadow-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
            <User size={12} className="text-gray-400" />
          </div>
          <span className="text-xs font-medium text-gray-600">{owner}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          <span>{lastUpdated}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button className="flex-1 rounded-xl bg-gray-50 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-100">
          Manage Bank
        </button>
        <button
          onClick={() => router.push("/dashboard/quizes?create=true")}
          className="flex-1 rounded-xl bg-orange-600 py-2 text-xs font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700"
        >
          Create Quiz
        </button>
      </div>
    </div>
  );
};

export const BankGrid: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {children}
  </div>
);

export const BankFilters: React.FC = () => (
  <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center">
    <div className="relative flex-1">
      <Search className="absolute top-3.5 left-4 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Search question banks..."
        className="w-full rounded-2xl border border-gray-100 bg-white py-3 pr-4 pl-12 shadow-sm transition-all focus:border-orange-200 focus:ring-2 focus:ring-orange-50"
      />
    </div>
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50">
        <Filter size={18} />
        Filters
      </button>
      <button className="flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700">
        <Plus size={18} />
        New Bank
      </button>
    </div>
  </div>
);
