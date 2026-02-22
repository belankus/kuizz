"use client";

import { useEffect, useState } from "react";

interface HostQuestionProps {
  question: string;
  options: { id: string; text: string }[];
  timeLeft: number;
  totalTime: number;
  remainingMs: number;
  answerStats: Record<string, number>;
  totalPlayers: number;
  correctOptionId?: string | null; // only filled during REVEAL
  correctOptionIds?: string[];
  phase: "QUESTION" | "REVEAL";
  onEndQuestion: () => void;
}

export default function HostQuestion({
  question,
  options,
  timeLeft,
  totalTime,
  remainingMs,
  answerStats,
  totalPlayers,
  correctOptionId,
  correctOptionIds,
  phase,
  onEndQuestion,
}: HostQuestionProps) {
  const totalAnswered = Object.values(answerStats).reduce((a, b) => a + b, 0);

  const progress = totalTime > 0 ? (remainingMs / (totalTime * 1000)) * 100 : 0;

  let barColor = "bg-green-500";
  let timerColor = "text-white";

  if (timeLeft <= 5) {
    barColor = "bg-red-600";
    timerColor = "text-red-500 animate-pulse";
  } else if (timeLeft <= 10) {
    barColor = "bg-yellow-400";
    timerColor = "text-yellow-400 animate-pulse";
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-indigo-900 via-blue-800 to-blue-900 px-8 py-8 text-white">
      {/* 🔥 Animated Time Progress Bar */}
      {phase === "QUESTION" && (
        <div className="mb-4 h-3 w-full overflow-hidden rounded bg-white/20">
          <div
            className={`h-3 transition-[width,background-color] duration-75 ease-linear ${barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Top Bar */}
      <div className="mb-8 flex items-center justify-between">
        <div className={`text-4xl font-bold ${timerColor}`}>
          {phase === "QUESTION" ? `${timeLeft}s` : "Answer Reveal"}
        </div>

        <div className="text-lg font-medium">
          {totalAnswered} / {totalPlayers} answered
        </div>
      </div>

      {/* Question */}
      <h1 className="mb-12 text-center text-4xl font-bold">{question}</h1>

      {/* Horizontal Bar Chart */}
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {options.map((opt) => {
          const count = answerStats[opt.id] || 0;

          const percentage =
            totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;

          const isCorrect =
            phase === "REVEAL" &&
            (correctOptionIds
              ? correctOptionIds.includes(opt.id)
              : opt.id === correctOptionId);

          return (
            <div key={opt.id}>
              <div className="mb-2 flex justify-between text-lg">
                <span>{opt.text}</span>
                <span>{count}</span>
              </div>

              <div className="relative h-6 overflow-hidden rounded bg-white/20">
                <div
                  className={`h-6 rounded transition-all duration-500 ${
                    isCorrect ? "bg-green-500" : "bg-gray-400"
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                {/* Percentage Label Inside Bar */}
                {percentage > 8 && (
                  <div className="absolute top-0 right-2 flex h-6 items-center text-sm font-semibold text-black">
                    {percentage.toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Controls */}
      <div className="mt-16 flex justify-center gap-6">
        {phase === "QUESTION" && (
          <button
            onClick={onEndQuestion}
            className="rounded-lg bg-white px-8 py-3 font-semibold text-indigo-800 shadow hover:bg-white/80"
          >
            End Question
          </button>
        )}
      </div>
    </div>
  );
}
