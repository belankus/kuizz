"use client";

import { useState } from "react";
import { Triangle, Diamond, Circle, Square } from "lucide-react";
import LiveSync from "./LiveSync";
import Avatar from "@/components/avatar/Avatar";
import type { AvatarModel } from "@/types";

interface QuestionProps {
  question: string;
  topic?: string;
  score?: number;
  rank?: number;
  playerName?: string;
  avatar?: AvatarModel | null;
  options: { id: string; text: string }[];
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  totalTime: number;
  remainingMs: number;
  onSelect: (id: string) => void;
}

const SHAPE_ICONS = [Triangle, Diamond, Circle, Square];
const BG_COLORS = [
  "bg-[#e11d48] hover:bg-[#be123c]", // Red
  "bg-[#2563eb] hover:bg-[#1d4ed8]", // Blue
  "bg-[#d97706] hover:bg-[#b45309]", // Yellow
  "bg-[#16a34a] hover:bg-[#15803d]", // Green
];

export default function Question({
  question,
  topic = "General Knowledge",
  score = 0,
  rank = 0,
  playerName = "Player",
  avatar = null,
  options,
  questionNumber,
  totalQuestions,
  timeLeft,
  totalTime,
  remainingMs,
  onSelect,
}: QuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Timer calculation
  const timerProgress =
    totalTime > 0 ? (remainingMs / (totalTime * 1000)) * 100 : 0;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (timerProgress / 100) * circumference;

  let timerColorClass = "stroke-indigo-600";
  if (timeLeft <= 5) {
    timerColorClass = "stroke-red-500 animate-pulse";
  } else if (timeLeft <= 10) {
    timerColorClass = "stroke-yellow-500";
  }

  // Footer overall progress
  const gameProgress =
    totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

  return (
    <div
      className="flex min-h-screen flex-col bg-[#f8f9fa] font-sans text-gray-900"
      style={{
        backgroundImage:
          "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Top Bar */}
      <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm md:h-20 md:px-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-8 w-18 items-center justify-center rounded-lg bg-[#4c1d95] text-base font-black text-white shadow-md md:h-10 md:w-24 md:text-xl">
            {questionNumber}{" "}
            <span className="mx-1 text-xs font-medium opacity-60 md:text-sm">
              /
            </span>{" "}
            {totalQuestions}
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold tracking-widest text-gray-400 md:text-[10px]">
              CURRENT TOPIC
            </span>
            <span className="text-xs font-bold text-gray-800 md:text-base">
              {topic}
            </span>
          </div>
        </div>

        {/* Logo Badge - Hidden on mobile */}
        <div className="absolute top-0 left-1/2 hidden -translate-x-1/2 items-center justify-center rounded-b-xl bg-black px-6 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.15)] md:flex">
          <span className="text-xl font-black tracking-widest text-white italic">
            KUIZZ
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold tracking-widest text-gray-400 md:text-[10px]">
              SCORE
            </span>
            <span className="text-sm font-black text-[#4c1d95] md:text-xl">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200 md:h-8" />
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold tracking-widest text-gray-400 md:text-[10px]">
              RANK
            </span>
            <span className="text-sm font-black text-[#f97316] md:text-xl">
              #{rank}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-4 md:px-6 md:py-8">
        {/* Question Card */}
        <div className="relative mt-8 mb-6 rounded-[20px] bg-white px-6 py-8 shadow-xl shadow-gray-200/50 md:mt-0 md:rounded-[28px] md:px-12 md:py-10">
          {/* Circular Timer - Repositioned for mobile */}
          <div className="absolute -top-10 left-1/2 flex h-20 w-20 -translate-x-1/2 flex-col items-center justify-center rounded-full bg-white shadow-lg md:top-1/2 md:left-[-40px] md:translate-x-0 md:-translate-y-1/2">
            <svg
              className="absolute h-16 w-16 -rotate-90 transform"
              viewBox="0 0 56 56"
            >
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="fill-none stroke-gray-100"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                className={`fill-none transition-all duration-100 ease-linear ${timerColorClass}`}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="relative z-10 text-xl leading-none font-black">
              {timeLeft}
            </span>
            <span className="relative z-10 mt-0.5 text-[8px] font-bold tracking-widest text-gray-400">
              SECONDS
            </span>
          </div>

          <h1 className="mx-auto max-w-3xl text-center text-xl leading-tight font-extrabold text-gray-800 md:text-4xl">
            {question}
          </h1>
        </div>

        {/* Image Context Placeholder */}
        <div className="relative mb-6 flex h-40 w-full items-center justify-center overflow-hidden rounded-[20px] bg-linear-to-br from-[#bcc4a9] to-[#5b6a50] shadow-inner md:h-64 md:rounded-[24px]">
          <span className="text-[120px] font-bold text-white/20 select-none md:text-[200px]">
            ?
          </span>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded bg-black/20 px-3 py-1.5 backdrop-blur-md">
            <div className="h-3 w-3 rounded-sm bg-white/80" />
            <span className="text-[10px] font-bold text-white md:text-xs">
              Image Context
            </span>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {options.map((opt, index) => {
            const Icon = SHAPE_ICONS[index % 4];
            const bgClass = BG_COLORS[index % 4];
            const isSelected = selected === opt.id;
            const isDisabled = selected !== null;

            return (
              <button
                key={opt.id}
                onClick={() => {
                  setSelected(opt.id);
                  onSelect(opt.id);
                }}
                disabled={isDisabled}
                className={`group relative flex min-h-[70px] items-center gap-4 overflow-hidden rounded-[16px] px-4 py-4 text-left shadow-lg transition-all duration-300 active:scale-95 md:min-h-[100px] md:gap-6 md:rounded-[20px] md:px-8 md:py-6 ${bgClass} ${
                  isSelected
                    ? "scale-95 opacity-100 ring-4 ring-white ring-offset-4"
                    : isDisabled
                      ? "opacity-40 grayscale"
                      : "hover:-translate-y-1 hover:shadow-xl"
                }`}
              >
                {/* Darker left strip behind icon */}
                <div className="absolute top-0 bottom-0 left-0 w-16 bg-black/10 md:w-24" />

                {/* Icon */}
                <div className="relative z-10 flex h-10 w-10 items-center justify-center md:h-14 md:w-14">
                  <Icon
                    className="h-7 w-7 text-white drop-shadow-md md:h-10 md:w-10"
                    fill="currentColor"
                  />
                </div>

                {/* Text */}
                <span className="relative z-10 flex-1 text-lg font-bold text-white drop-shadow-sm md:text-2xl">
                  {opt.text}
                </span>

                {/* Optional checkmark overlay if selected, but maybe too busy */}
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="flex h-14 items-center justify-between bg-white px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:h-16 md:px-8">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-2 ring-[#8b5cf6]/30 md:h-10 md:w-10">
            <Avatar config={avatar} fallbackSeed={playerName} size={32} />
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-bold tracking-widest text-gray-400 md:text-[9px]">
              PLAYER
            </span>
            <span className="text-xs font-bold text-gray-900 md:text-base">
              {playerName}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1 px-4 md:w-64 md:flex-initial md:gap-1.5 md:px-0">
          <div className="flex w-full items-center justify-between text-[8px] font-bold tracking-widest text-gray-400 md:text-[10px]">
            <span>PROGRESS</span>
            <span>{Math.round(gameProgress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 md:h-2">
            <div
              className="h-full rounded-full bg-[#4c1d95] transition-all duration-700 ease-out"
              style={{ width: `${gameProgress}%` }}
            />
          </div>
        </div>

        <div className="hidden md:block">
          <LiveSync />
        </div>
        <div className="md:hidden">
          {/* Minimal LiveSync indicator for mobile */}
          <div className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
        </div>
      </footer>
    </div>
  );
}
