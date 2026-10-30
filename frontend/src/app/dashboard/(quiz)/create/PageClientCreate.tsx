"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { SharedQuizEditor } from "@/components/quiz/SharedQuizEditor";
import { QuizModelType } from "@/types";
import {useTranslations} from "next-intl";

export default function CreatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("QuizFactory");

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
        toast.error(t("failToSave", { status: status.toLowerCase() }));
        setIsSaving(false);
        return;
      }

      toast.success(
        status === "PUBLISHED"
          ? t("quizSaved")
          : t("draftSaved"),
      );
      router.push("/dashboard/quizes");
    } catch (err) {
      toast.error(t("errorSaving"), {
        description: err instanceof Error ? err.message : t("unknownError"),
      });
      setIsSaving(false);
    }
  }

  return <SharedQuizEditor onSave={handleSaveQuiz} isSaving={isSaving} />;
}
