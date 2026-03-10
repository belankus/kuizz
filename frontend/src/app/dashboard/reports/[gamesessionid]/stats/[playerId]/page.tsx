"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  Timer,
  Trophy,
  User,
  Calendar,
} from "lucide-react";
import { handleError } from "@/lib/handle-error";
import { handleApiError } from "@/lib/api-error-handler";

type SnapshotQuestion = {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  timeLimit: number;
};

type GameAnswer = {
  questionIndex: number;
  selectedOptionId: string;
  isCorrect: boolean;
  responseTime: number;
};

type PlayerHistoryDetail = {
  id: string;
  nickname: string;
  score: number;
  joinedAt: string;
  session: {
    title: string;
    createdAt: string;
    questions: SnapshotQuestion[];
    totalQuestions: number;
  };
  answers: GameAnswer[];
};

export default function HostPlayerReviewPage({
  params,
}: {
  params: Promise<{ gamesessionid: string; playerId: string }>;
}) {
  const { gamesessionid, playerId } = use(params);
  const router = useRouter();
  const [detail, setDetail] = useState<PlayerHistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await apiFetch(
          `/game-session/${gamesessionid}/players/${playerId}`,
        );
        await handleApiError(res);
        const data = await res.json();
        setDetail(data);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [gamesessionid, playerId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800/50" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-gray-400">Not Found</h2>
        <p className="mt-2 text-gray-500">Player detail not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const correctAnswersCount = detail.answers.filter((a) => a.isCorrect).length;
  const accuracy =
    detail.session.totalQuestions > 0
      ? Math.round((correctAnswersCount / detail.session.totalQuestions) * 100)
      : 0;

  const questions = detail.session.questions || [];

  return (
    <div className="min-h-screen space-y-8 bg-transparent p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2 -ml-2 text-gray-500 hover:bg-transparent dark:text-gray-400"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Stats
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {detail.session.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {new Date(detail.joinedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              Player:{" "}
              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                {detail.nickname}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-r px-4 text-center dark:border-gray-800">
            <div className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
              Player Score
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              <Trophy className="mr-1 mb-1 inline-block h-5 w-5" />
              {detail.score.toLocaleString()}
            </div>
          </div>
          <div className="px-4 text-center">
            <div className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
              Accuracy
            </div>
            <div
              className={`text-2xl font-bold ${accuracy > 70 ? "text-green-600" : accuracy > 40 ? "text-orange-500" : "text-red-500"}`}
            >
              {accuracy}%
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6">
        <h2 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
          Question Review
          <Badge variant="secondary" className="ml-2 font-normal">
            {detail.session.totalQuestions} Questions
          </Badge>
        </h2>

        {questions.map((q, idx) => {
          const userAnswer = detail.answers.find(
            (a) => a.questionIndex === idx,
          );
          const isCorrect = userAnswer?.isCorrect;

          return (
            <div
              key={idx}
              className={`overflow-hidden rounded-xl border-t border-r border-b border-l-4 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${
                !userAnswer
                  ? "border-l-gray-300"
                  : isCorrect
                    ? "border-l-green-500"
                    : "border-l-red-500"
              }`}
            >
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Question {idx + 1}
                    </span>
                    <h3 className="text-lg leading-tight font-semibold text-gray-900 dark:text-white">
                      {q.question}
                    </h3>
                  </div>
                  {userAnswer ? (
                    isCorrect ? (
                      <Badge
                        variant="secondary"
                        className="border-green-200 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      >
                        <CheckCircleIcon className="mr-1 h-3 w-3" /> Correct
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="border-red-200 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      >
                        <XCircleIcon className="mr-1 h-3 w-3" /> Incorrect
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="text-gray-400">
                      No Answer
                    </Badge>
                  )}
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  {q.options.map((opt, oIdx) => {
                    const isUserChoice =
                      userAnswer?.selectedOptionId === opt.id;
                    const isCorrectOption = (q.correctOptionIds || []).includes(
                      opt.id,
                    );

                    let variantClass =
                      "bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700";
                    if (isCorrectOption)
                      variantClass =
                        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-1 ring-green-400/30";
                    if (isUserChoice && !isCorrectOption)
                      variantClass =
                        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ring-1 ring-red-400/30";

                    return (
                      <div
                        key={oIdx}
                        className={`flex items-center justify-between rounded-lg border p-3 text-sm ${variantClass}`}
                      >
                        <span
                          className={`${isCorrectOption ? "font-semibold text-green-900 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {opt.text}
                        </span>
                        <div className="flex items-center gap-2">
                          {isUserChoice && (
                            <Badge className="h-5 px-1.5 text-[10px] uppercase">
                              Player Choice
                            </Badge>
                          )}
                          {isCorrectOption && (
                            <CheckCircleIcon
                              className={`h-4 w-4 ${isUserChoice ? "text-green-600" : "text-green-500"}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {userAnswer && (
                  <div className="flex w-fit items-center rounded-md bg-gray-50 p-2 px-3 text-xs text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                    <Timer className="mr-1 h-3 w-3" />
                    Response Time:{" "}
                    <span className="ml-1 font-medium">
                      {(userAnswer.responseTime / 1000).toFixed(2)}s
                    </span>
                    <span className="mx-2 text-gray-300 dark:text-gray-700">
                      |
                    </span>
                    Limit: {q.timeLimit}s
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
