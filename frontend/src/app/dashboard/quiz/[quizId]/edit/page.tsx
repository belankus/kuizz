"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import EditorLayout from "@/components/quiz-editor/EditorLayout";
import QuestionEditor from "@/components/quiz-editor/QuestionEditor";
import { useQuizEditorStore } from "@/store/quiz-editor/useQuizEditorStore";
import { toast } from "sonner";
import { quizSchema, formatZodErrors } from "@/lib/validations/quiz";
import { handleError } from "@/lib/handle-error";
import { UserError } from "@/lib/errors/user-error";
import { SystemError } from "@/lib/errors/system-error";

import { apiFetch } from "@/lib/auth";

export default function QuizEditPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const {
    title,
    description,
    questions,
    setQuiz,
    setSaving,
    setErrors,
    clearErrors,
  } = useQuizEditorStore();

  const handleSave = async () => {
    clearErrors();

    // Validate
    const result = quizSchema.safeParse({ title, description, questions });

    if (!result.success) {
      const fieldErrors = formatZodErrors(result.error);
      setErrors(fieldErrors);
      handleError(
        new UserError("Please fix the errors before saving", {
          code: "QUIZ_VALIDATION_ERROR",
        }),
      );
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch(`/quiz/${quizId}`, {
        method: "PUT",
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        throw new SystemError("Failed to save quiz", {
          code: "QUIZ_SAVE_FAILURE",
          requestPath: `/quiz/${quizId}`,
        });
      }

      toast.success("Quiz saved successfully");
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await apiFetch(`/quiz/${quizId}`);
        if (!response.ok) {
          throw new SystemError("Failed to fetch quiz details", {
            code: "QUIZ_FETCH_FAILURE",
            requestPath: `/quiz/${quizId}`,
          });
        }
        const data = await response.json();
        setQuiz(data);
      } catch (error) {
        handleError(error);
      }
    };

    if (quizId && quizId !== "create") {
      fetchQuiz();
    }
  }, [quizId, setQuiz]);

  return (
    <EditorLayout onSave={handleSave}>
      <QuestionEditor />
    </EditorLayout>
  );
}
