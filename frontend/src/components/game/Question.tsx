"use client";

import { useState } from "react";

interface QuestionProps {
  question: string;
  options: { id: string; text: string }[];
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  totalTime: number;
  remainingMs: number;
  onSelect: (id: string) => void;
}

export default function Question({
  question,
  options,
  questionNumber,
  totalQuestions,
  timeLeft,
  totalTime,
  remainingMs,
  onSelect,
}: QuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
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
    <div className="flex min-h-screen flex-col bg-linear-to-br from-blue-800 via-blue-700 to-blue-900 text-white">
      <div className="flex items-center justify-between bg-black/20 px-6 py-4">
        <div className="text-sm">
          Question {questionNumber} / {totalQuestions}
        </div>
        <div className={`text-xl font-bold ${timerColor}`}>⏳ {timeLeft}s</div>
      </div>
      {/* 🔥 Animated Time Progress Bar */}
      <div className="mb-4 h-3 w-full bg-white/20">
        <div
          className={`h-3 transition-[width,background-color] duration-75 ease-linear ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl">{question}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        {options.map((opt, index) => (
          <button
            key={opt.id}
            onClick={() => {
              setSelected(opt.id);
              onSelect(opt.id);
            }}
            disabled={!!selected}
            className={`rounded-xl px-6 py-6 text-lg font-semibold shadow transition ${
              selected === opt.id ? "scale-95 opacity-80" : "hover:scale-105"
            } ${
              index === 0
                ? "bg-red-500"
                : index === 1
                  ? "bg-blue-500"
                  : index === 2
                    ? "bg-yellow-500 text-black"
                    : "bg-green-500"
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
