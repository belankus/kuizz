"use client";

import React from "react";
import { Search, Filter, Sparkles } from "lucide-react";
import {
  TemplateCard,
  TemplateGrid,
} from "@/components/templates/TemplateComponents";

const MOCK_TEMPLATES = [
  {
    id: "1",
    title: "Project Management Foundations",
    description: "Standard agile and waterfall methodologies for junior PMs.",
    questionCount: 40,
    difficulty: "MEDIUM" as const,
    category: "Business",
  },
  {
    id: "2",
    title: "General Knowledge Bowl",
    description:
      "Fun and diverse questions about pop culture, history, and geography.",
    questionCount: 25,
    difficulty: "EASY" as const,
    category: "Entertainment",
  },
  {
    id: "3",
    title: "Cybersecurity Advanced Audit",
    description:
      "In-depth technical assessment of network and application security.",
    questionCount: 60,
    difficulty: "HARD" as const,
    category: "Technology",
  },
  {
    id: "4",
    title: "Language Fluency: French B1",
    description:
      "Intermediate level grammar, vocabulary, and listening comprehension.",
    questionCount: 35,
    difficulty: "MEDIUM" as const,
    category: "Education",
  },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Template Library
          </h1>
          <p className="text-gray-500">
            Kickstart your assessment with pre-built professional templates.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition-all hover:scale-[1.02]">
          <Sparkles size={18} />
          AI Template Generator
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-3.5 left-4 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full rounded-2xl border border-gray-100 bg-white py-3 pr-4 pl-12 shadow-sm transition-all focus:border-orange-200 focus:ring-2 focus:ring-orange-50"
          />
        </div>
        <button className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-6 py-3 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50">
          <Filter size={18} />
          All Categories
        </button>
      </div>

      <TemplateGrid>
        {MOCK_TEMPLATES.map((tpl) => (
          <TemplateCard key={tpl.id} {...tpl} />
        ))}
      </TemplateGrid>
    </div>
  );
}
