"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import EditorLayout from "@/components/quiz-editor/EditorLayout";
import QuestionEditor from "@/components/quiz-editor/QuestionEditor";
import { useQuizEditorStore } from "@/store/quiz-editor/useQuizEditorStore";
import { toast } from "sonner";
import { quizSchema, formatZodErrors } from "@/lib/validations/quiz";
import { handleError } from "@/lib/handle-error";
import { UserError } from "@/lib/errors/user-error";
import { SystemError } from "@/lib/errors/system-error";
import { apiFetch } from "@/lib/auth";

export default function CreateQuizPage() {
  const router = useRouter();
  const {
    title,
    description,
    questions,
    setQuiz,
    setSaving,
    setErrors,
    clearErrors,
  } = useQuizEditorStore();

  useEffect(() => {
    // Initialize a clean state for a new quiz
    setQuiz({
      id: "new",
      title: "New Quiz",
      description: "",
      questions: [],
    });
  }, [setQuiz]);

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
      const response = await apiFetch("/quiz", {
        method: "POST",
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        throw new SystemError("Failed to create quiz", {
          code: "QUIZ_CREATE_FAILURE",
          requestPath: "/quiz",
        });
      }

      const data = await response.json();
      toast.success("Quiz created successfully");

      // Redirect to edit page with the new quiz ID
      router.push(`/dashboard/quiz/${data.id}/edit`);
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorLayout onSave={handleSave}>
      <QuestionEditor />
    </EditorLayout>
  );
}
