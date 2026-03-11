"use client";

import React, { useState } from "react";
import { X, Search, Database, ChevronRight, Check, Plus } from "lucide-react";
import {
  useQuizEditorStore,
  QuestionType,
} from "@/store/quiz-editor/useQuizEditorStore";

interface ImportBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportBankModal: React.FC<ImportBankModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<"SELECT_BANK" | "SELECT_QUESTIONS">(
    "SELECT_BANK",
  );
  const [selectedBank, setSelectedBank] = useState<{
    id: string;
    name: string;
    questions: number;
  } | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const { addQuestion } = useQuizEditorStore();

  if (!isOpen) return null;

  const banks = [
    { id: "1", name: "Science Fundamentals", questions: 24 },
    { id: "2", name: "Math Logic", questions: 15 },
    { id: "3", name: "World History", questions: 42 },
  ];

  const questions = [
    {
      id: "q1",
      content: "What is the atomic number of Gold?",
      type: "MULTIPLE_CHOICE",
    },
    { id: "q2", content: "Who discovered Penicillin?", type: "SHORT_ANSWER" },
    { id: "q3", content: "The Earth is flat.", type: "TRUE_FALSE" },
  ];

  const handleImport = () => {
    // In a real app, we would fetch the full question details
    selectedQuestions.forEach((id) => {
      const q = questions.find((item) => item.id === id);
      if (q) {
        addQuestion({
          content: q.content,
          type: q.type as QuestionType,
          sourceType: "BANK_COPY",
          sourceBankId: selectedBank?.id || undefined,
        });
      }
    });
    onClose();
    setStep("SELECT_BANK");
    setSelectedQuestions([]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Import Questions
            </h2>
            <p className="text-sm text-gray-500">
              {step === "SELECT_BANK"
                ? "Select a question bank to browse"
                : `Browsing ${selectedBank?.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === "SELECT_BANK" ? (
            <div className="space-y-4">
              <div className="relative mb-6">
                <Search
                  className="absolute top-3.5 left-4 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search banks..."
                  className="w-full rounded-2xl border-0 bg-gray-50 py-3.5 pr-4 pl-12 transition-all focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid gap-3">
                {banks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => {
                      setSelectedBank(bank);
                      setStep("SELECT_QUESTIONS");
                    }}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-100 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <Database size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-gray-900">{bank.name}</h4>
                      <p className="text-xs font-medium text-gray-500">
                        {bank.questions} Questions
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-gray-300 group-hover:text-blue-600"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setStep("SELECT_BANK")}
                className="mb-4 block text-sm font-bold text-blue-600 hover:underline"
              >
                ← Back to banks
              </button>
              <div className="space-y-3">
                {questions.map((q) => (
                  <label
                    key={q.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                      selectedQuestions.includes(q.id)
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="pt-1">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
                          selectedQuestions.includes(q.id)
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        {selectedQuestions.includes(q.id) && (
                          <Check size={14} strokeWidth={4} />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedQuestions.includes(q.id)}
                        onChange={() => {
                          setSelectedQuestions((prev) =>
                            prev.includes(q.id)
                              ? prev.filter((id) => id !== q.id)
                              : [...prev, q.id],
                          );
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                          {q.type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {q.content}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-gray-50 p-8">
          <p className="text-sm font-bold text-gray-500">
            {selectedQuestions.length} questions selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              disabled={selectedQuestions.length === 0}
              onClick={handleImport}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />
              Import Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportBankModal;
