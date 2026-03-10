"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { SharedQuizEditor } from "@/components/quiz/SharedQuizEditor";
import { QuizModelType } from "@/types";
import { handleError } from "@/lib/handle-error";
import { handleApiError } from "@/lib/api-error-handler";

export default function CreatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveQuiz(
    payload: QuizModelType,
    status: "DRAFT" | "PUBLISHED",
  ) {
    setIsSaving(true);
    try {
      const res = await apiFetch("/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await handleApiError(res);

      toast.success(
        status === "PUBLISHED"
          ? "Quiz published successfully!"
          : "Draft saved!",
      );
      router.push("/dashboard/quizes");
    } catch (err) {
      handleError(err);
      setIsSaving(false);
    }
  }

  return <SharedQuizEditor onSave={handleSaveQuiz} isSaving={isSaving} />;
}
