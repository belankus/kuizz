"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { nanoid } from "nanoid";
import { SharedQuizEditor } from "@/components/quiz/SharedQuizEditor";
import { OptionModelType, QuestionModelType, QuizModelType } from "@/types";

const colorPalette = [
  { color: "bg-red-600", icon: "triangle" },
  { color: "bg-blue-600", icon: "diamond" },
  { color: "bg-yellow-500", icon: "circle" },
  { color: "bg-green-600", icon: "square" },
];

interface Question extends QuestionModelType {
  id: string;
  text: string;
  type: "Quiz" | "True/False";
  timeLimit: number;
  points: number;
  answerOptions: "Single Select" | "Multi Select";
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    color: string;
    shape: string;
  }[];
  order?: number;
  quizId?: string;
}

interface QuizModel extends QuizModelType {
  questions: Question[];
}

export default function EditPage() {
  const { quizId } = useParams();
  const router = useRouter();

  const [initialData, setInitialData] = useState<QuizModel | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiFetch(`/quiz/${quizId}`)
      .then((res) => res.json())
      .then((data) => {
        setInitialData({
          ...data,
          questions: data.questions.map((q: QuestionModelType) => ({
            id: nanoid(),
            text: q.text,
            type:
              q.options.length === 2 &&
              (q.options[0].text === "True" || q.options[0].text === "False")
                ? "True/False"
                : "Quiz",
            timeLimit: q.timeLimit,
            points: 1000,
            answerOptions:
              q.options.filter((o: OptionModelType) => o.isCorrect).length > 1
                ? "Multi Select"
                : "Single Select",
            options: q.options.map((o: OptionModelType, index: number) => ({
              id: nanoid(),
              text: o.text,
              isCorrect: o.isCorrect,
              color: colorPalette[index % colorPalette.length].color,
              shape: colorPalette[index % colorPalette.length].icon,
            })),
          })),
        });
      })
      .catch(() => {
        toast.error("Failed to load quiz");
      });
  }, [quizId]);

  async function handleSaveQuiz(
    payload: QuizModelType,
    status: "DRAFT" | "PUBLISHED",
  ) {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/quiz/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to update quiz");
        setIsSaving(false);
        return;
      }

      toast.success(
        status === "PUBLISHED"
          ? "Quiz published successfully!"
          : "Draft updated!",
      );
      router.push("/dashboard/quizes");
    } catch (err) {
      toast.error("Failed to update quiz", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setIsSaving(false);
    }
  }

  if (!initialData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#130b1c] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <SharedQuizEditor
      initialTitle={initialData.title}
      initialDescription={initialData.description}
      initialQuestions={initialData.questions}
      onSave={handleSaveQuiz}
      isSaving={isSaving}
    />
  );
}
