"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Circle,
  Diamond,
  Square,
  Triangle,
  X,
  Eye,
  Settings2,
  Image as ImageIcon,
  Copy,
  Trash2,
  Plus,
  GripVertical,
  LogOut,
} from "lucide-react";
import { nanoid } from "nanoid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { QuestionModelType, QuizModelType } from "@repo/types";

const colorPalette = [
  { color: "bg-red-600", icon: "triangle" },
  { color: "bg-blue-600", icon: "diamond" },
  { color: "bg-yellow-500", icon: "circle" },
  { color: "bg-green-600", icon: "square" },
];

const initialAnswers = [
  {
    id: nanoid(),
    text: "",
    isCorrect: true,
    color: "bg-red-600",
    shape: "triangle",
  },
  {
    id: nanoid(),
    text: "",
    isCorrect: false,
    color: "bg-blue-600",
    shape: "diamond",
  },
  {
    id: nanoid(),
    text: "",
    isCorrect: false,
    color: "bg-yellow-500",
    shape: "circle",
  },
  {
    id: nanoid(),
    text: "",
    isCorrect: false,
    color: "bg-green-600",
    shape: "square",
  },
];

interface Question extends QuestionModelType {
  id: string;
  text: string;
  type: "Quiz" | "True/False";
  timeLimit: number;
  points: number;
  answerOptions: string;
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
interface SortableItemProps {
  q: Question;
  index: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  duplicateQuestion: (index: number) => void;
  deleteQuestion: (index: number) => void;
}

function SortableItem({
  q,
  index,
  activeIndex,
  setActiveIndex,
  duplicateQuestion,
  deleteQuestion,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isActive = index === activeIndex;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group mb-2 flex cursor-pointer items-stretch gap-2 pr-2 ${isActive ? "" : "opacity-70 hover:opacity-100"}`}
      onClick={() => setActiveIndex(index)}
    >
      <div
        className={`w-1 shrink-0 ${isActive ? "rounded-r-md bg-purple-500" : "bg-transparent"}`}
      />
      <div
        className={`flex flex-1 flex-col overflow-hidden rounded-xl ${isActive ? "bg-[#1c1228] ring-2 ring-purple-500" : "bg-[#1c1228]/50 hover:bg-[#1c1228]"}`}
      >
        <div className="flex items-center justify-between p-2 pt-3 pb-0">
          <span className="ml-2 text-xs font-semibold text-gray-300">
            {index + 1}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              duplicateQuestion(index);
            }}
            className="p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteQuestion(index);
            }}
            className="p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="relative flex justify-center p-2">
          <div className="relative flex h-20 w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-gray-700/50 bg-[#130b1c]">
            {q.text ? (
              <span className="line-clamp-2 px-2 text-center text-[8px] text-gray-400">
                {q.text}
              </span>
            ) : (
              <ImageIcon size={16} className="text-gray-600" />
            )}
            <div className="absolute right-1 bottom-1 left-1 flex h-1 gap-1">
              {q.type === "True/False" ? (
                <>
                  <div className="h-full flex-1 rounded-full bg-blue-600"></div>
                  <div className="h-full flex-1 rounded-full bg-red-600"></div>
                </>
              ) : (
                <>
                  <div className="h-full flex-1 rounded-full bg-red-600"></div>
                  <div className="h-full flex-1 rounded-full bg-blue-600"></div>
                  <div className="h-full flex-1 rounded-full bg-yellow-500"></div>
                  <div className="h-full flex-1 rounded-full bg-green-600"></div>
                </>
              )}
            </div>
          </div>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="flex h-4 cursor-grab items-center justify-center bg-[#231733] hover:bg-purple-900/40 active:cursor-grabbing"
        >
          <div className="h-1 w-8 rounded-full bg-gray-600"></div>
        </div>
      </div>
    </div>
  );
}

export interface SharedQuizEditorProps {
  initialTitle?: string;
  initialDescription?: string;
  initialQuestions?: Question[];
  isSaving: boolean;
  onSave: (
    payload: QuizModelType,
    status: "DRAFT" | "PUBLISHED",
  ) => Promise<void>;
}

export function SharedQuizEditor({
  initialTitle = "Untitled Quiz",
  initialDescription = "",
  initialQuestions,
  isSaving,
  onSave,
}: SharedQuizEditorProps) {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState(initialTitle);
  const [quizDescription, setQuizDescription] = useState(initialDescription);
  const [activeIndex, setActiveIndex] = useState(0);

  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions || [
      {
        id: nanoid(),
        text: "",
        type: "Quiz",
        timeLimit: 20,
        points: 1000,
        answerOptions: "Single Select",
        options: structuredClone(initialAnswers).map((a) => ({
          ...a,
          id: nanoid(),
          isCorrect: a.shape === "triangle",
          text: "",
        })),
      },
    ],
  );

  const currentQuestion = questions[activeIndex] || questions[0];

  useEffect(() => {
    if (initialTitle) setQuizTitle(initialTitle);
    if (initialDescription) setQuizDescription(initialDescription);
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialTitle, initialDescription, initialQuestions]);

  function renderIcon(type: string) {
    const size = 32;
    switch (type) {
      case "triangle":
        return <Triangle size={size} fill="currentColor" />;
      case "diamond":
        return <Diamond size={size} fill="currentColor" />;
      case "circle":
        return <Circle size={size} fill="currentColor" />;
      case "square":
        return <Square size={size} fill="currentColor" />;
      default:
        return <Circle size={size} fill="currentColor" />;
    }
  }

  function updateQuestionField<K extends keyof Question>(
    field: K,
    value: Question[K],
  ) {
    const updated = structuredClone(questions);
    if (!updated[activeIndex]) return;
    updated[activeIndex][field] = value;

    if (field === "type" && value === "True/False") {
      updated[activeIndex].options = [
        {
          id: nanoid(),
          text: "True",
          isCorrect: true,
          color: "bg-blue-600",
          shape: "diamond",
        },
        {
          id: nanoid(),
          text: "False",
          isCorrect: false,
          color: "bg-red-600",
          shape: "triangle",
        },
      ];
    } else if (
      field === "type" &&
      value === "Quiz" &&
      updated[activeIndex].options.length === 2 &&
      updated[activeIndex].options[0].text === "True"
    ) {
      updated[activeIndex].options = structuredClone(initialAnswers).map(
        (a) => ({
          ...a,
          id: nanoid(),
          text: "",
          isCorrect: false,
        }),
      );
      updated[activeIndex].options[0].isCorrect = true;
    }

    setQuestions(updated);
  }

  function updateAnswer(id: string, text: string) {
    const updated = structuredClone(questions);
    updated[activeIndex].options = updated[activeIndex].options.map(
      (a: (typeof initialAnswers)[0]) => (a.id === id ? { ...a, text } : a),
    );
    setQuestions(updated);
  }

  function toggleCorrect(id: string) {
    const updated = structuredClone(questions);
    const isMultiSelect = updated[activeIndex].answerOptions === "Multi Select";

    updated[activeIndex].options = updated[activeIndex].options.map(
      (a: (typeof initialAnswers)[0]) => {
        if (a.id === id) {
          return { ...a, isCorrect: isMultiSelect ? !a.isCorrect : true };
        }
        return isMultiSelect ? a : { ...a, isCorrect: false };
      },
    );

    setQuestions(updated);
  }

  function addAnswer() {
    const updated = structuredClone(questions);
    const answers = updated[activeIndex].options;

    if (answers.length >= 6) {
      toast.error("Maximum 6 answers allowed");
      return;
    }

    const paletteItem = colorPalette[answers.length % colorPalette.length];

    answers.push({
      id: nanoid(),
      text: "",
      isCorrect: false,
      color: paletteItem.color,
      shape: paletteItem.icon,
    });

    setQuestions(updated);
  }

  function removeAnswer(id: string) {
    const updated = structuredClone(questions);

    if (updated[activeIndex].options.length <= 2) {
      toast.error("Minimum 2 answers required");
      return;
    }

    updated[activeIndex].options = updated[activeIndex].options.filter(
      (a: (typeof initialAnswers)[0]) => a.id !== id,
    );

    setQuestions(updated);
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        id: nanoid(),
        text: "",
        type: "Quiz",
        timeLimit: 20,
        points: 1000,
        answerOptions: "Single Select",
        options: structuredClone(initialAnswers).map((a) => ({
          ...a,
          id: nanoid(),
          isCorrect: a.shape === "triangle",
          text: "",
        })),
      },
    ]);
    setActiveIndex(questions.length);
  }

  function duplicateQuestion(indexToDuplicate: number = activeIndex) {
    const duplicated = structuredClone(questions[indexToDuplicate]);
    duplicated.id = nanoid();
    duplicated.options = duplicated.options.map(
      (a: (typeof initialAnswers)[0]) => ({
        ...a,
        id: nanoid(),
      }),
    );

    const newQuestions = [...questions];
    newQuestions.splice(indexToDuplicate + 1, 0, duplicated);
    setQuestions(newQuestions);
    setActiveIndex(indexToDuplicate + 1);
  }

  function deleteQuestion(index: number) {
    if (questions.length <= 1) {
      toast.error("At least one question required");
      return;
    }

    const updated = structuredClone(questions);
    updated.splice(index, 1);

    setQuestions(updated);
    setActiveIndex(Math.max(0, index - 1));
  }

  const triggerSave = async (status: "DRAFT" | "PUBLISHED") => {
    // Validate
    if (status === "PUBLISHED") {
      for (const q of questions) {
        if (!q.text.trim()) {
          toast.error("Each question must have text before publishing");
          return;
        }

        const validAnswers = q.options.filter(
          (a: (typeof initialAnswers)[0]) => a.text.trim() !== "",
        );

        if (validAnswers.length < 2) {
          toast.error("Each question must have at least 2 answers to publish");
          return;
        }

        if (
          !validAnswers.some((a: (typeof initialAnswers)[0]) => a.isCorrect)
        ) {
          toast.error("Each question must have at least 1 correct answer");
          return;
        }
      }
    }

    const payload = {
      title: quizTitle,
      description: quizDescription,
      status: status,
      questions: questions.map((q, index) => ({
        ...q,
        text: q.text,
        timeLimit: q.timeLimit,
        order: index,
        options: q.options.map((a: (typeof initialAnswers)[0]) => ({
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      })),
    };

    await onSave(payload, status);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#130b1c] font-sans text-white">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 bg-[#1a0f26] px-4">
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/quizes")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700"
          >
            <LogOut
              size={16}
              className="ml-[-2px] rotate-180 transform text-gray-300"
            />
          </button>

          <div className="flex w-full max-w-sm flex-col">
            <input
              value={quizTitle}
              onChange={(e) => {
                setQuizTitle(e.target.value);
              }}
              placeholder="Enter quiz title..."
              className="rounded bg-transparent px-1 text-sm font-bold transition placeholder:text-gray-500 focus:ring-1 focus:ring-purple-500/50 focus:outline-none"
            />
            <input
              value={quizDescription}
              onChange={(e) => {
                setQuizDescription(e.target.value);
              }}
              placeholder="Add a description..."
              className="rounded bg-transparent px-1 text-[11px] text-gray-400 transition placeholder:text-gray-600 focus:ring-1 focus:ring-purple-500/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full bg-gray-800 px-4 text-sm font-medium text-gray-200 hover:bg-gray-700 hover:text-white"
          >
            <Eye className="mr-2" size={16} /> Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => triggerSave("DRAFT")}
            disabled={isSaving}
            className="h-9 rounded-full border-gray-600 bg-transparent font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Save Draft
          </Button>
          <Button
            onClick={() => triggerSave("PUBLISHED")}
            disabled={isSaving}
            className="h-9 rounded-full bg-purple-600 px-6 font-medium text-white hover:bg-purple-700"
          >
            Publish
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Questions */}
        <aside className="flex w-56 flex-col overflow-hidden border-r border-gray-800 bg-[#1a0f26] pt-4">
          <div className="flex shrink-0 items-center justify-between px-4 pb-2 text-xs font-bold tracking-wider text-gray-400">
            QUESTIONS ({questions.length})
            <GripVertical size={14} className="opacity-50" />
          </div>

          <div className="h-0 flex-1">
            <ScrollArea className="h-full w-full">
              <div className="px-2 pb-6">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    if (!over || active.id === over.id) return;

                    const oldIndex = questions.findIndex(
                      (q) => q.id === active.id,
                    );
                    const newIndex = questions.findIndex(
                      (q) => q.id === over.id,
                    );

                    const updated = arrayMove(questions, oldIndex, newIndex);
                    setQuestions(updated);
                    setActiveIndex(newIndex);
                  }}
                >
                  <SortableContext
                    items={questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {questions.map((q, index) => (
                      <SortableItem
                        key={q.id}
                        q={q}
                        index={index}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        duplicateQuestion={duplicateQuestion}
                        deleteQuestion={deleteQuestion}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <div className="mt-2">
                  <Button
                    onClick={addQuestion}
                    variant="outline"
                    className="h-10 w-full rounded-full border border-dashed border-gray-700 bg-transparent font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <Plus size={16} className="mr-2" /> Add Question
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-y-auto bg-[#130b1c] px-8">
          <div className="flex flex-1 flex-col py-8 pb-32">
            {/* Question Text */}
            <div className="mb-8 w-full">
              <input
                className="w-full rounded-xl bg-transparent p-4 text-center text-4xl font-bold text-white transition-colors placeholder:text-gray-600 focus:bg-[#1a0f26]/50 focus:outline-none"
                value={currentQuestion.text}
                onChange={(e) => updateQuestionField("text", e.target.value)}
                placeholder="Start typing your question"
              />
            </div>

            {/* Media Dropzone */}
            <div className="mb-8 flex max-h-[400px] min-h-[250px] flex-1 items-center justify-center">
              <div className="group flex h-full w-full max-w-2xl cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-gray-700 bg-[#1c1228]/30 transition hover:border-gray-500 hover:bg-[#1c1228]/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#1a0f26] transition-transform group-hover:scale-105">
                  <ImageIcon size={32} className="text-purple-500" />
                </div>
                <div className="text-center">
                  <h3 className="mb-2 text-xl font-bold text-white">
                    Find and insert media
                  </h3>
                  <p className="text-sm text-gray-500">
                    Drag and drop or click to upload
                  </p>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-none bg-[#1a0f26] px-4 text-xs text-white hover:bg-gray-800"
                  >
                    Library
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-none bg-[#1a0f26] px-4 text-xs text-white hover:bg-gray-800"
                  >
                    Giphy
                  </Button>
                </div>
              </div>
            </div>

            {/* Answer Options Grid */}
            <div
              className={`grid gap-4 ${currentQuestion.type === "True/False" ? "mx-auto w-full max-w-3xl grid-cols-2" : "grid-cols-2"}`}
            >
              {currentQuestion.options.map((a: (typeof initialAnswers)[0]) => (
                <div key={a.id} className="group relative">
                  <div
                    className={`flex min-h-[72px] items-center overflow-hidden rounded-full ${a.color} border-b-4 border-black/20 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] focus-within:ring-4 focus-within:ring-white`}
                  >
                    <div className="flex h-full w-16 items-center justify-center text-white/90">
                      {renderIcon(a.shape)}
                    </div>
                    <div className="flex h-full flex-1 items-center">
                      <input
                        value={a.text}
                        onChange={(e) => updateAnswer(a.id, e.target.value)}
                        placeholder="Add answer..."
                        className="w-full bg-transparent text-lg font-bold text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                    <div className="flex h-full items-center px-4">
                      <button
                        onClick={() => toggleCorrect(a.id)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-4 transition-all focus:outline-none ${
                          a.isCorrect
                            ? "scale-110 border-green-400 bg-green-500 text-white/90"
                            : "border-white/30 bg-transparent hover:border-white/50"
                        }`}
                      >
                        {a.isCorrect && (
                          <Check size={20} className="stroke-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  {currentQuestion.options.length > 2 &&
                    currentQuestion.type !== "True/False" && (
                      <button
                        onClick={() => removeAnswer(a.id)}
                        className="absolute -top-2 -right-2 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform group-hover:flex hover:scale-110"
                      >
                        <X size={14} />
                      </button>
                    )}
                </div>
              ))}

              {currentQuestion.type !== "True/False" &&
                currentQuestion.options.length < 6 && (
                  <button
                    onClick={addAnswer}
                    className="flex min-h-[72px] items-center justify-center gap-2 rounded-full border-2 border-dashed border-gray-700 bg-[#1c1228]/30 font-bold text-gray-500 transition-colors hover:border-gray-500 hover:bg-[#1c1228]/50 hover:text-gray-400"
                  >
                    <Plus size={24} /> Add option
                  </button>
                )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Settings */}
        <aside className="z-10 hidden w-72 flex-col overflow-y-auto border-l border-gray-800 bg-[#1a0f26] xl:flex">
          <div className="flex items-center gap-2 border-b border-gray-800 px-6 py-4">
            <Settings2 size={18} className="text-gray-400" />
            <h2 className="text-sm font-bold tracking-wide text-white">
              SETTINGS
            </h2>
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-6 p-6">
              {/* Question Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">
                  QUESTION TYPE
                </label>
                <div className="flex rounded-md bg-gray-900/50 p-1">
                  <button
                    onClick={() => updateQuestionField("type", "Quiz")}
                    className={`flex-1 rounded py-1.5 text-xs font-semibold transition ${
                      currentQuestion.type === "Quiz"
                        ? "bg-purple-600 text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Quiz
                  </button>
                  <button
                    onClick={() => updateQuestionField("type", "True/False")}
                    className={`flex-1 rounded py-1.5 text-xs font-semibold transition ${
                      currentQuestion.type === "True/False"
                        ? "bg-purple-600 text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    True/False
                  </button>
                </div>
              </div>

              {/* Time Limit */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">
                  TIME LIMIT
                </label>
                <div className="relative">
                  <select
                    value={currentQuestion.timeLimit}
                    onChange={(e) =>
                      updateQuestionField("timeLimit", Number(e.target.value))
                    }
                    className="w-full appearance-none rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={5}>5 seconds</option>
                    <option value={10}>10 seconds</option>
                    <option value={20}>20 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                  </select>
                </div>
              </div>

              {/* Points */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400">
                    POINTS
                  </label>
                  <span className="text-xs font-semibold text-purple-400">
                    {currentQuestion.points}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="500"
                  value={currentQuestion.points}
                  onChange={(e) =>
                    updateQuestionField("points", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Standard</span>
                  <span>Double</span>
                </div>
              </div>

              {/* Answer Options */}
              {currentQuestion.type === "Quiz" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">
                    ANSWER OPTIONS
                  </label>
                  <select
                    value={currentQuestion.answerOptions}
                    onChange={(e) =>
                      updateQuestionField("answerOptions", e.target.value)
                    }
                    className="w-full appearance-none rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Single Select">Single Select</option>
                    <option value="Multi Select">Multi Select</option>
                  </select>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 border-t border-gray-800 p-4">
            <Button
              onClick={() => duplicateQuestion()}
              variant="outline"
              className="flex-1 rounded-full border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Copy size={16} className="mr-2" /> Duplicate
            </Button>
            <Button
              onClick={() => deleteQuestion(activeIndex)}
              variant="outline"
              className="flex-1 rounded-full border-red-900/50 bg-transparent text-red-500 hover:bg-red-950 hover:text-red-400"
            >
              <Trash2 size={16} className="mr-2" /> Delete
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
