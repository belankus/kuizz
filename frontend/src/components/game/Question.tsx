"use client";

import { useState } from "react";

interface QuestionProps {
  question: string;
  options: { id: string; text: string }[];
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  onSelect: (id: string) => void;
}

export default function Question({
  question,
  options,
  questionNumber,
  totalQuestions,
  timeLeft,
  onSelect,
}: QuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 text-white">
      <div className="flex items-center justify-between bg-black/20 px-6 py-4">
        <div className="text-sm">
          Question {questionNumber} / {totalQuestions}
        </div>
        <div className="text-xl font-bold">⏳ {timeLeft}s</div>
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
