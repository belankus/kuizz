"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { SharedQuizEditor } from "@/components/quiz/SharedQuizEditor";
import { QuizModelType } from "@repo/types";

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

      if (!res.ok) {
        toast.error(`Failed to save quiz as ${status.toLowerCase()}`);
        setIsSaving(false);
        return;
      }

      toast.success(
        status === "PUBLISHED"
          ? "Quiz published successfully!"
          : "Draft saved!",
      );
      router.push("/dashboard/quizes");
    } catch (err) {
      toast.error("An error occurred while saving the quiz", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setIsSaving(false);
    }
  }

  return <SharedQuizEditor onSave={handleSaveQuiz} isSaving={isSaving} />;
}
