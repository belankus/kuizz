"use client";

import React from "react";
import {
  useQuizEditorStore,
  QuestionType,
  Difficulty,
} from "@/store/quiz-editor/useQuizEditorStore";
import { Clock, Award, ChevronDown } from "lucide-react";

const QuestionSettings: React.FC = () => {
  const { questions, selectedQuestionId, updateQuestion } =
    useQuizEditorStore();
  const question = questions.find((q) => q.id === selectedQuestionId);

  if (!question) {
    return (
      <aside className="flex w-80 shrink-0 flex-col items-center justify-center border-l bg-white p-6 text-gray-400">
        <p className="text-sm">Settings will appear here</p>
      </aside>
    );
  }

  const handleTypeChange = (type: QuestionType) => {
    updateQuestion(question.id, { type });
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    updateQuestion(question.id, { difficulty });
  };

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-l bg-white">
      <div className="space-y-8 p-6">
        <div>
          <h3 className="mb-4 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Question Settings
          </h3>

          {/* Question Type */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Question Type
            </label>
            <div className="relative">
              <select
                value={question.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as QuestionType)
                }
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-orange-200 focus:ring-1 focus:ring-orange-100"
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="ESSAY">Essay</option>
              </select>
              <ChevronDown
                className="absolute top-3 right-3 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={`rounded-lg border py-2 text-[10px] font-bold transition-all ${
                    question.difficulty === d
                      ? "border-orange-600 bg-orange-600 text-white"
                      : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Points */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Points
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  defaultValue={10}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-orange-200 focus:ring-1 focus:ring-orange-100"
                />
                <Award
                  className="absolute top-2.5 right-3 text-gray-400"
                  size={16}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-400">
                points per correct answer
              </span>
            </div>
          </div>

          {/* Time Limit */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Time Limit
            </label>
            <div className="flex items-center gap-2">
              {["30s", "1m", "2m"].map((t) => (
                <button
                  key={t}
                  className={`flex-1 rounded-xl border py-2 text-xs font-medium ${
                    t === "1m"
                      ? "border-orange-600 bg-orange-50 text-orange-600"
                      : "border-gray-100 bg-white text-gray-500"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button className="rounded-xl border border-gray-100 p-2 text-gray-400">
                <Clock size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Question Options */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Shuffle answers
            </span>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              defaultChecked
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Partial credit
            </span>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 text-gray-700">
              Required
            </span>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              defaultChecked
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50">
            Save Changes
          </button>
        </div>
      </div>
    </aside>
  );
};

export default QuestionSettings;
