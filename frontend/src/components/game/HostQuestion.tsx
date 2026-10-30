"use client";

import {
  FastForward,
  BarChart2,
  Triangle,
  Square,
  Circle,
  Diamond,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAudioManager } from "@/lib/useAudioManager";

interface HostQuestionProps {
  question: string;
  options: { id: string; text: string }[];
  timeLeft: number;
  totalTime: number;
  remainingMs: number;
  answerStats: Record<string, number>;
  totalPlayers: number;
  correctOptionId?: string | null;
  correctOptionIds?: string[];
  phase: "QUESTION" | "REVEAL";
  onEndQuestion: () => void;
  onSkipQuestion?: () => void;
  roomCode: string;
  topic?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  onEndGame: () => void;
}

const SHAPE_COLORS = [
  {
    bg: "bg-[#ef4444]",
    track: "bg-[#4a2e37]",
    bar: "bg-[#ef4444]",
    icon: Triangle,
    name: "red",
  },
  {
    bg: "bg-[#3b82f6]",
    track: "bg-[#25325a]",
    bar: "bg-[#3b82f6]",
    icon: Diamond,
    name: "blue",
  },
  {
    bg: "bg-[#eab308]",
    track: "bg-[#483d21]",
    bar: "bg-[#eab308]",
    icon: Circle,
    name: "yellow",
  },
  {
    bg: "bg-[#22c55e]",
    track: "bg-[#224032]",
    bar: "bg-[#22c55e]",
    icon: Square,
    name: "green",
  },
];

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
  topic = "General Knowledge",
  onEndQuestion,
  onSkipQuestion,
  roomCode,
  currentQuestionIndex,
  totalQuestions,
  onEndGame,
}: HostQuestionProps) {
  const t = useTranslations("Game");
  const { playClick, playGameBgm, stopAll } = useAudioManager();

  useEffect(() => {
    playGameBgm();

    return stopAll;
  }, [playGameBgm, stopAll]);

  const totalAnswered = Object.values(answerStats).reduce((a, b) => a + b, 0);
  const waitingFor = Math.max(0, totalPlayers - totalAnswered);
  const percentCompleted =
    totalPlayers > 0 ? Math.round((totalAnswered / totalPlayers) * 100) : 0;

  const timerProgress =
    totalTime > 0 ? (remainingMs / (totalTime * 1000)) * 100 : 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (timerProgress / 100) * circumference;

  let timerColorClass = "stroke-[#f97316]"; // orange
  if (timeLeft <= 5) {
    timerColorClass = "stroke-red-500 animate-pulse";
  } else if (timeLeft <= 10) {
    timerColorClass = "stroke-yellow-400";
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1a0f1a] font-sans text-white">
      {/* Top Bar */}
      <header className="relative flex min-h-[5.5rem] flex-wrap items-center justify-between gap-4 border-b border-white/5 px-4 pt-4 pb-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#f97316] text-xl font-bold">
            ?
          </div>
          <div className="max-w-[180px] truncate text-xl font-black tracking-tighter sm:max-w-[300px] sm:text-2xl">
            {topic}
          </div>
        </div>

        <div className="order-3 flex w-full items-center justify-around font-medium sm:order-2 sm:absolute sm:top-1/2 sm:left-1/2 sm:w-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:gap-16">
          <div className="flex flex-col items-center">
            <div className="mb-1 text-[10px] font-bold tracking-widest text-gray-400">
              PIN CODE
            </div>
            <div className="text-xl font-bold tracking-[0.2em] sm:text-2xl">
              {roomCode.slice(0, 3)} {roomCode.slice(3)}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-1 text-[10px] font-bold tracking-widest text-gray-400">
              {t("players")}
            </div>
            <div className="text-xl font-bold sm:text-2xl">
              {totalAnswered} / {totalPlayers}
            </div>
          </div>
        </div>

        <div className="order-2 flex items-center gap-2 sm:order-3 sm:gap-4">
          <button
            onClick={() => {
              playClick();
              onSkipQuestion?.();
            }}
            className="flex items-center gap-2 rounded-lg bg-[#2a1b25] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3a2835] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <FastForward size={16} fill="white" />
            <span>{t("skip")}</span>
          </button>
          <button
            onClick={() => {
              playClick();
              onEndGame();
            }}
            className="rounded-lg bg-[#ef4444] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            {t("endGame")}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center px-4 pt-6 pb-8 sm:px-10 sm:pt-12">
        {/* Question Header */}
        <div className="mb-4 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1 text-[10px] font-bold tracking-widest text-[#f97316] sm:mb-6 sm:px-5 sm:py-1.5 sm:text-[11px]">
          {t("questionOf", {
            current: currentQuestionIndex + 1,
            total: totalQuestions,
          })}
        </div>
        <h1 className="mb-8 max-w-5xl text-center text-2xl leading-tight font-extrabold tracking-tight sm:mb-14 sm:text-4xl lg:text-[40px]">
          {question}
        </h1>

        <div className="flex w-full max-w-5xl flex-col gap-8 lg:flex-row">
          {/* Left Column - Timer & Responses */}
          <div className="flex w-full shrink-0 flex-col items-center gap-6 pt-0 lg:w-[280px] lg:pt-4">
            {/* Circular Timer */}
            <div className="relative flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56">
              <svg
                className="absolute h-full w-full -rotate-90 transform"
                viewBox="0 0 160 160"
              >
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="fill-[#1a0f1a] stroke-[#2a1b25]"
                  strokeWidth="8"
                />
                {phase === "QUESTION" && (
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className={`fill-none transition-all duration-100 ease-linear ${timerColorClass}`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="butt"
                  />
                )}
              </svg>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-5xl leading-none font-bold sm:text-7xl">
                  {phase === "QUESTION" ? timeLeft : 0}
                </span>
                <span className="mt-2 text-[10px] font-bold tracking-[0.2em] text-gray-400">
                  SECONDS
                </span>
              </div>
            </div>

            {/* Responses Card */}
            <div className="flex w-full flex-col items-center justify-center rounded-[20px] border border-white/5 bg-[#22151f] p-4 shadow-xl sm:p-6">
              <div className="mt-1 mb-1 text-xs font-medium text-gray-400 sm:mt-2 sm:mb-2">
                Responses received
              </div>
              <div className="mb-1 text-3xl font-extrabold text-white sm:mb-2 sm:text-5xl">
                {totalAnswered}
              </div>
            </div>

            {phase === "QUESTION" && totalAnswered === totalPlayers && (
              <button
                onClick={() => {
                  playClick();
                  onEndQuestion();
                }}
                className="w-full rounded-xl bg-white px-8 py-3.5 font-bold text-[#1a0f1a] shadow-lg transition-transform hover:bg-gray-200 active:scale-95"
              >
                Show Results
              </button>
            )}

            {phase === "REVEAL" && onSkipQuestion && (
              <button
                onClick={() => {
                  playClick();
                  onSkipQuestion();
                }}
                className="w-full rounded-xl bg-[#f97316] px-8 py-3.5 font-bold shadow-lg transition-transform hover:bg-orange-600 active:scale-95"
              >
                Next Question
              </button>
            )}
          </div>

          {/* Right Column - Answer Distribution */}
          <div className="flex-1 rounded-[24px] border border-white/5 bg-[#22151f] p-5 shadow-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between sm:mb-10">
              <div className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                <BarChart2 className="text-[#f97316]" size={24} />
                Live Answer Distribution
              </div>
              {phase === "QUESTION" && (
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#22c55e]">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
                  LIVE UPDATES
                </div>
              )}
            </div>

            <div className="space-y-5 sm:space-y-7">
              {options.map((opt, index) => {
                const count = answerStats[opt.id] || 0;
                const percentage =
                  totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
                const style = SHAPE_COLORS[index % SHAPE_COLORS.length];
                const Icon = style.icon;

                const isCorrect =
                  phase === "REVEAL" &&
                  (correctOptionIds
                    ? correctOptionIds.includes(opt.id)
                    : opt.id === correctOptionId);

                const opacityClass =
                  phase === "REVEAL" && !isCorrect
                    ? "opacity-30 grayscale"
                    : "opacity-100";

                return (
                  <div
                    key={opt.id}
                    className={`transition-all duration-500 ${opacityClass}`}
                  >
                    <div className="mb-2.5 flex items-center justify-between font-bold">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg} text-white shadow-sm`}
                        >
                          <Icon size={16} fill="currentColor" />
                        </div>
                        <span className="text-base sm:text-[17px]">
                          {opt.text}
                        </span>
                      </div>
                      <span className="ml-2 text-xs font-bold text-gray-400 sm:text-[15px]">
                        {count} Answers
                      </span>
                    </div>
                    <div
                      className={`h-4 w-full overflow-hidden rounded-full ${style.track}`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${style.bar}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Progress Bar */}
      <footer className="mx-4 mb-8 rounded-[20px] border border-white/5 bg-[#22151f] p-4 sm:mx-10 sm:p-6">
        <div className="mb-3 flex justify-between text-xs font-medium sm:text-[13px]">
          <span className="text-gray-400">
            Waiting for{" "}
            <span className="font-bold text-white">{waitingFor} players</span>
          </span>
          <span className="text-gray-400">
            <span className="text-base font-bold text-white sm:text-lg">
              {percentCompleted}%
            </span>{" "}
            Completed
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#1a0f1a] sm:h-4">
          <div
            className="h-full rounded-full bg-linear-to-r from-[#f97316] to-[#f472b6] transition-all duration-700 ease-out"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </footer>
    </div>
  );
}