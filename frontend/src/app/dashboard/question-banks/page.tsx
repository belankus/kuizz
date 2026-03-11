"use client";

import React from "react";
import {
  BankFilters,
  BankGrid,
  BankCard,
} from "@/components/question-bank/BankComponents";

const MOCK_BANKS = [
  {
    id: "1",
    name: "General Science - Grade 10",
    description:
      "Comprehensive bank covering Biology, Chemistry, and Physics modules.",
    questionCount: 156,
    usageCount: 12,
    owner: "Alex Rivers",
    lastUpdated: "2 days ago",
    visibility: "PUBLIC" as const,
  },
  {
    id: "2",
    name: "Corporate Training 2024",
    description: "Internal compliance and security awareness questions.",
    questionCount: 45,
    usageCount: 3,
    owner: "Me",
    lastUpdated: "5 hours ago",
    visibility: "PRIVATE" as const,
  },
  {
    id: "3",
    name: "World History: Middle Ages",
    description: "Questions about European and Asian history from 500-1500 AD.",
    questionCount: 89,
    usageCount: 7,
    owner: "Department of History",
    lastUpdated: "1 week ago",
    visibility: "SHARED" as const,
  },
];

export default function QuestionBanksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Question Banks
        </h1>
        <p className="text-gray-500">
          Manage and reuse your curated collection of questions across multiple
          quizzes.
        </p>
      </div>

      <BankFilters />

      <BankGrid>
        {MOCK_BANKS.map((bank) => (
          <BankCard key={bank.id} {...bank} />
        ))}
      </BankGrid>
    </div>
  );
}
