"use client";

import React from "react";
import { Layout, Clock, BarChart, Eye, Play } from "lucide-react";

interface TemplateCardProps {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  thumbnail?: string;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  description,
  questionCount,
  difficulty,
  category,
}) => {
  return (
    <div className="group rounded-[2rem] border border-gray-100 bg-white p-3 transition-all hover:shadow-2xl hover:shadow-gray-100">
      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-gray-50">
        <div className="absolute inset-0 flex items-center justify-center text-gray-200">
          <Layout size={48} />
        </div>
        <div className="absolute top-4 left-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold tracking-wider text-gray-600 uppercase shadow-sm backdrop-blur">
            {category}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg transition-transform hover:scale-110">
              <Eye size={18} />
            </button>
            <button className="flex items-center gap-2 rounded-full bg-orange-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-transform hover:scale-105">
              <Play size={16} fill="currentColor" />
              Use
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              difficulty === "EASY"
                ? "bg-green-500"
                : difficulty === "MEDIUM"
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
          ></div>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            {difficulty}
          </span>
        </div>

        <h3 className="mb-1 text-lg leading-tight font-bold text-gray-900 transition-colors group-hover:text-orange-600">
          {title}
        </h3>
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500">
          {description ||
            "A professional quiz template designed for effective assessment and learning outcomes."}
        </p>

        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex items-center gap-1.5 text-gray-500">
            <BarChart size={14} />
            <span className="text-xs font-bold">{questionCount} Qs</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock size={14} />
            <span className="text-xs font-bold">~15m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplateGrid: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {children}
  </div>
);
