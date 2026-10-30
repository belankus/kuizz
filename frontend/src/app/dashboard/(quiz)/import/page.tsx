"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { apiFetch } from "@/lib/auth";
import { useTranslations } from "next-intl";

type Option = {
  text: string;
  isCorrect: boolean;
};

type QuestionPreview = {
  text: string;
  timeLimit: number;
  options: Option[];
};

type ExcelRow = {
  Question: string;
  TimeLimit: number;
  Correct: string;
} & Record<`Option${number}`, string>;

export default function ImportPage() {
  const t = useTranslations("QuizImport");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<QuestionPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Tab name
  useEffect(() => {
    document.title = `${t("pageTitle")} | Kuizz`;
  }, [t]);
  
  function parseRows(rows: ExcelRow[]) {
    const questions: QuestionPreview[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      const text = row.Question?.toString().trim();
      const timeLimit = Number(row.TimeLimit) || 20;

      if (!text) {
        errors.push(t("rowQuestionRequired", { row: rowNumber }));
        return;
      }

      const options: Option[] = [];

      for (let i = 1; i <= 8; i++) {
        const opt = row[`Option${i}`];
        if (opt && opt.toString().trim() !== "") {
          options.push({
            text: opt.toString().trim(),
            isCorrect: false,
          });
        }
      }

      if (options.length < 2) {
        errors.push(t("rowMinOptions", { row: rowNumber }));
        return;
      }

      const correctRaw = row.Correct?.toString();
      if (!correctRaw) {
        errors.push(t("rowCorrectRequired", { row: rowNumber }));
        return;
      }

      const correctIndexes = correctRaw
        .split(",")
        .map((v: string) => Number(v.trim()));

      correctIndexes.forEach((i: number) => {
        if (i > 0 && i <= options.length) {
          options[i - 1].isCorrect = true;
        } else {
          errors.push(
            t("rowCorrectIndexOutOfRange", { row: rowNumber, index: i }),
          );
        }
      });

      if (!options.some((o) => o.isCorrect)) {
        errors.push(t("rowNoCorrectAnswer", { row: rowNumber }));
        return;
      }

      questions.push({
        text,
        timeLimit,
        options,
      });
    });

    return { questions, errors };
  }

  const handleFile = async (file: File) => {
    try {
      setErrors([]);
      setPreview([]);
      setFileName(file.name);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });

      const parsed = parseRows(rows);
      setPreview(parsed.questions);
      setErrors(parsed.errors);
    } catch (err) {
      toast.error(t("fileReadFailed"), {
        description: err instanceof Error ? err.message : t("unknownError"),
      });
    }
  };

  const handleImport = async () => {
    if (errors.length) return;

    try {
      setLoading(true);

      const res = await apiFetch("/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t("importedQuizTitle"),
          questions: preview,
        }),
      });

      if (!res.ok) {
        throw new Error(t("importFailed"));
      }

      toast.success(t("importSuccess"));
      setFileName(null);
      setPreview([]);
      setErrors([]);
    } catch (err) {
      toast.error(t("importFailed"), {
        description: err instanceof Error ? err.message : t("unknownError"),
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    const templateData = [
      {
        Question: t("templateQuestionCapital"),
        TimeLimit: 30,
        Option1: t("templateOptionTokyo"),
        Option2: t("templateOptionOsaka"),
        Option3: t("templateOptionKyoto"),
        Option4: t("templateOptionNagoya"),
        Correct: "1",
      },
      {
        Question: t("templateQuestionPrime"),
        TimeLimit: 45,
        Option1: "2",
        Option2: "3",
        Option3: "4",
        Option4: "5",
        Correct: "1,2,4",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "quiz-template.xlsx");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
    onDrop: (files) => handleFile(files[0]),
  });

  return (
    <div>
      <PageBreadcrumb pageTitle={t("title")} />

      <div className="space-y-6">
        <ComponentCard title={t("fromExcel")}>
          <div className="mx-auto max-w-4xl space-y-8 p-8">
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-600">
                {fileName ? t("selectedFile", { fileName }) : t("dropzone")}
              </p>
            </div>

            <Button
              variant={"outline"}
              onClick={downloadTemplate}
              className="mt-4 text-sm"
            >
              <FileSpreadsheet size={16} />
              {t("downloadTemplate")}
            </Button>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h2 className="mb-2 font-semibold text-red-700">
                  {t("validationErrors")}
                </h2>
                <ul className="space-y-1 text-sm text-red-600">
                  {errors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  {t("questionsDetected", { count: preview.length })}
                </div>

                {preview.map((q, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-white p-4 shadow-sm"
                  >
                    <div className="font-semibold">{q.text}</div>
                    <div className="text-xs text-gray-500">
                      {t("timeLimit", { seconds: q.timeLimit })}
                    </div>

                    <ul className="mt-2 space-y-1">
                      {q.options.map((o, idx) => (
                        <li
                          key={idx}
                          className={
                            o.isCorrect ? "font-medium text-green-600" : ""
                          }
                        >
                          {idx + 1}. {o.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <Button
                  onClick={handleImport}
                  disabled={errors.length > 0 || loading}
                  className="disabled:opacity-50"
                >
                  {loading ? t("importing") : t("importQuiz")}
                </Button>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
