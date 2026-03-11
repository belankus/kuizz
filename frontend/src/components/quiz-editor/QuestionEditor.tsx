"use client";

import React from "react";
import { useQuizEditorStore } from "@/store/quiz-editor/useQuizEditorStore";
import {
  AlertCircle,
  Image as ImageIcon,
  X,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const QuestionEditor: React.FC = () => {
  const { questions, selectedQuestionId, updateQuestion, errors } =
    useQuizEditorStore();
  const questionIndex = questions.findIndex((q) => q.id === selectedQuestionId);
  const question = questions[questionIndex];

  if (!question) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-400">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p>Select a question to start editing</p>
      </div>
    );
  }

  const questionError = errors[`questions.${questionIndex}.content`];
  const answersError = errors[`questions.${questionIndex}.answers`];

  const handleContentChange = (content: string) => {
    updateQuestion(question.id, { content });
  };
  const handleAnswerChange = (index: number, text: string) => {
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], text };
    updateQuestion(question.id, { answers: newAnswers });
  };

  const handleToggleCorrect = (index: number) => {
    const newAnswers = question.answers.map((a, i) => ({
      ...a,
      isCorrect:
        i === index
          ? !a.isCorrect
          : question.type === "MULTIPLE_CHOICE"
            ? false
            : a.isCorrect,
    }));
    updateQuestion(question.id, { answers: newAnswers });
  };

  const handleAddAnswer = () => {
    updateQuestion(question.id, {
      answers: [...question.answers, { text: "", isCorrect: false }],
    });
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = question.answers.filter((_, i) => i !== index);
    updateQuestion(question.id, { answers: newAnswers });
  };

  return (
    <div className="space-y-6">
      {/* Error Banner for Question-level errors (like answers min requirement) */}
      {answersError && (
        <div className="animate-shake flex gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="shrink-0 text-red-600" size={20} />
          <p className="text-sm font-semibold text-red-900">{answersError}</p>
        </div>
      )}

      {/* Warning for Imported Questions */}
      {question.sourceType !== "MANUAL" && (
        <div className="flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="shrink-0 text-amber-600" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">
              Editing an imported question
            </h4>
            <p className="text-sm text-amber-700">
              Editing this question will create a local copy and detach it from
              the original bank.
            </p>
          </div>
          <button className="ml-auto text-amber-400 hover:text-amber-600">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Main Card */}
      <div
        className={`space-y-8 rounded-2xl border bg-white p-8 shadow-sm transition-all ${
          questionError || answersError
            ? "border-red-200 ring-1 ring-red-50"
            : "border-gray-200"
        }`}
      >
        {/* Source Indicator */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 uppercase">
            {question.type.replace("_", " ")}
          </span>
          {question.sourceType !== "MANUAL" && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              Source: Question Bank
            </div>
          )}
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className={`text-xs font-bold tracking-wider uppercase ${
                questionError ? "text-red-500" : "text-gray-500"
              }`}
            >
              Question Text
            </label>
            {questionError && (
              <span className="text-[10px] font-bold text-red-500 uppercase">
                {questionError}
              </span>
            )}
          </div>
          <textarea
            value={question.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Type your question here..."
            className={`min-h-[100px] w-full resize-none border-0 p-0 text-2xl font-medium placeholder:text-gray-300 focus:ring-0 ${
              questionError ? "text-red-600 placeholder:text-red-200" : ""
            }`}
          />
        </div>

        {/* Media Upload Placeholder */}
        <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 p-12 text-gray-400 transition-colors hover:bg-gray-50">
          <ImageIcon size={32} className="mb-2" />
          <span className="text-sm">
            Add an image or video to this question
          </span>
        </div>

        {/* Answer Options */}
        <div className="space-y-4">
          <label
            className={`text-xs font-bold tracking-wider uppercase ${
              answersError ? "text-red-500" : "text-gray-500"
            }`}
          >
            Answer Options
          </label>
          <div className="space-y-3">
            {question.answers.map((answer, index) => {
              const answerError =
                errors[`questions.${questionIndex}.answers.${index}.text`];
              return (
                <div key={index} className="group flex items-center gap-3">
                  <button
                    onClick={() => handleToggleCorrect(index)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      answer.isCorrect
                        ? "bg-green-500 text-white shadow-lg shadow-green-100"
                        : "bg-gray-50 text-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  <div
                    className={`flex flex-1 items-center rounded-xl border bg-white px-4 py-3 transition-all ${
                      answerError
                        ? "border-red-300 ring-1 ring-red-50 focus-within:border-red-400 focus-within:ring-red-100"
                        : "border-gray-200 focus-within:border-orange-200 focus-within:ring-1 focus-within:ring-orange-100"
                    }`}
                  >
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      placeholder={answerError || `Option ${index + 1}`}
                      className={`flex-1 border-0 p-0 text-base focus:ring-0 ${
                        answerError
                          ? "text-red-600 placeholder:text-red-300"
                          : ""
                      }`}
                    />
                    <span className="ml-2 text-xs font-bold text-gray-300">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveAnswer(index)}
                    className="flex h-10 w-10 items-center justify-center text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}

            <button
              onClick={handleAddAnswer}
              className={`flex w-full items-center justify-center rounded-xl border border-dashed py-3 text-sm font-medium transition-all ${
                answersError
                  ? "border-red-200 text-red-400 hover:border-red-300 hover:text-red-600"
                  : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
              }`}
            >
              Add answer option...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
