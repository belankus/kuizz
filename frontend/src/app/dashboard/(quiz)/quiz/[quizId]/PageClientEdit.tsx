"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Check, Circle, Diamond, Square, Triangle, X } from "lucide-react";
import { nanoid } from "nanoid";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialAnswers = [
  {
    id: nanoid(),
    text: "",
    correct: true,
    color: "bg-red-500",
    shape: "triangle",
  },
  {
    id: nanoid(),
    text: "",
    correct: false,
    color: "bg-blue-500",
    shape: "diamond",
  },
  {
    id: nanoid(),
    text: "",
    correct: false,
    color: "bg-green-500",
    shape: "circle",
  },
  {
    id: nanoid(),
    text: "",
    correct: false,
    color: "bg-yellow-500",
    shape: "square",
  },
];

export default function EditPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState("Untitled Quiz");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const colorPalette = [
    { color: "bg-red-500", icon: "triangle" },
    { color: "bg-blue-500", icon: "diamond" },
    { color: "bg-green-500", icon: "circle" },
    { color: "bg-yellow-500", icon: "square" },
  ];
  const [questions, setQuestions] = useState([
    {
      id: nanoid(),
      text: "",
      timeLimit: 20,
      answers: initialAnswers,
    },
  ]);
  const currentQuestion = questions[activeIndex];

  useEffect(() => {
    apiFetch(`/quiz/${quizId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuizTitle(data.title);
        setQuestions(
          data.questions.map((q: any) => ({
            id: nanoid(),
            text: q.text,
            timeLimit: q.timeLimit,
            answers: q.options.map((o: any, index: number) => ({
              id: nanoid(),
              text: o.text,
              correct: o.isCorrect,
              color: colorPalette[index % colorPalette.length].color,
              shape: colorPalette[index % colorPalette.length].icon,
            })),
          })),
        );
      });
  }, []);

  function renderIcon(type: string) {
    const size = 24;

    switch (type) {
      case "triangle":
        return <Triangle size={size} />;
      case "diamond":
        return <Diamond size={size} />;
      case "circle":
        return <Circle size={size} />;
      case "square":
        return <Square size={size} />;
      default:
        return <Circle size={size} />;
    }
  }

  function updateQuestionText(text: string) {
    const updated = structuredClone(questions);
    updated[activeIndex].text = text;
    setQuestions(updated);
  }

  function updateQuestionTimeLimit(timeLimit: number) {
    const updated = structuredClone(questions);
    updated[activeIndex].timeLimit = timeLimit;
    setQuestions(updated);
  }

  function updateAnswer(id: string, text: string) {
    const updated = structuredClone(questions);
    updated[activeIndex].answers = updated[activeIndex].answers.map((a) =>
      a.id === id ? { ...a, text } : a,
    );
    setQuestions(updated);
  }

  function toggleCorrect(id: string) {
    const updated = structuredClone(questions);

    updated[activeIndex].answers = updated[activeIndex].answers.map((a) =>
      a.id === id ? { ...a, correct: !a.correct } : a,
    );

    setQuestions(updated);
  }

  function addAnswer() {
    const updated = structuredClone(questions);
    const answers = updated[activeIndex].answers;

    const paletteItem = colorPalette[answers.length % colorPalette.length];

    answers.push({
      id: nanoid(),
      text: "",
      correct: false,
      color: paletteItem.color,
      shape: paletteItem.icon,
    });

    setQuestions(updated);
  }

  function removeAnswer(id: string) {
    const updated = structuredClone(questions);

    if (updated[activeIndex].answers.length <= 2) {
      toast.error("Minimum 2 answers required", { position: "bottom-right" });
      return;
    }

    updated[activeIndex].answers = updated[activeIndex].answers.filter(
      (a) => a.id !== id,
    );

    setQuestions(updated);
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        id: nanoid(),
        text: "",
        timeLimit: 20,
        answers: initialAnswers,
      },
    ]);

    setActiveIndex(questions.length);
  }

  async function handleUpdateQuiz() {
    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error("Each question must have text", {
          position: "bottom-right",
        });
        return;
      }

      const validAnswers = q.answers.filter((a) => a.text.trim() !== "");

      if (validAnswers.length < 2) {
        toast.error("Each question must have at least 2 answers", {
          position: "bottom-right",
        });
        return;
      }

      if (!validAnswers.some((a) => a.correct)) {
        toast.error("Each question must have 1 correct answer", {
          position: "bottom-right",
        });
        return;
      }
    }
    const payload = {
      title: quizTitle,
      questions: questions.map((q, index) => ({
        text: q.text,
        timeLimit: q.timeLimit,
        order: index,
        options: q.answers.map((a) => ({
          text: a.text,
          isCorrect: a.correct,
        })),
      })),
    };

    try {
      const res = await apiFetch(`/quiz/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to update quiz");
        return;
      }

      const data = await res.json();
      toast.promise(Promise.resolve(data), {
        loading: "Updating quiz...",
        success: "Quiz updated successfully!",
        error: "Failed to update quiz",
        position: "bottom-right",
      });

      router.push("/dashboard/quizes");
    } catch (err) {
      toast.error("Failed to update quiz", { position: "bottom-right" });
    }
  }

  function SortableItem({ q, index }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: q.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`mb-2 flex w-full items-start gap-2 rounded border p-3 ${
          index === activeIndex ? "bg-indigo-100" : ""
        }`}
      >
        {/* DRAG HANDLE */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab px-1 text-gray-400 active:cursor-grabbing"
        >
          ☰
        </div>

        {/* CLICK AREA */}
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => setActiveIndex(index)}
        >
          <div className="text-sm font-medium">Question {index + 1}</div>
          <div className="truncate text-xs opacity-60">
            {q.text || "Untitled question"}
          </div>
        </div>

        {/* DELETE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteQuestion(index);
          }}
          className="text-xs text-red-500"
        >
          ✕
        </button>
      </div>
    );
  }

  function deleteQuestion(index: number) {
    if (questions.length <= 1) {
      toast.error("At least one question required", {
        position: "bottom-right",
      });
      return;
    }

    const updated = structuredClone(questions);
    updated.splice(index, 1);

    setQuestions(updated);
    setActiveIndex(Math.max(0, index - 1));
  }

  return (
    <div className="grid min-h-[80vh] grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,320px)] gap-6">
      {/* Left sidebar - question list */}
      <aside className="h-fit min-w-0 space-y-4">
        <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-4 shadow">
          <div>
            {isEditingTitle ? (
              <input
                autoFocus
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={() => {
                  if (!quizTitle.trim()) {
                    setQuizTitle("Untitled Quiz");
                  }
                  setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full border-b bg-transparent text-lg font-semibold transition-all duration-200 outline-none"
              />
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                className="group cursor-text text-lg font-semibold"
              >
                {quizTitle}
                <span className="ml-2 text-xs opacity-0 group-hover:opacity-60">
                  ✏️
                </span>
              </h3>
            )}
          </div>
        </div>

        <ScrollArea className="h-96 w-full rounded-xl bg-white p-2 shadow [&_[data-radix-scroll-area-viewport]>div]:block! [&_[data-radix-scroll-area-viewport]>div]:min-w-0!">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (!over || active.id === over.id) return;

              const oldIndex = questions.findIndex((q) => q.id === active.id);
              const newIndex = questions.findIndex((q) => q.id === over.id);

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
                <SortableItem key={q.id} q={q} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        </ScrollArea>

        <div>
          <button
            onClick={addQuestion}
            className="w-full rounded bg-blue-600 px-3 py-2 text-white"
          >
            + Add
          </button>
        </div>
      </aside>

      {/* Main editor area */}
      <main className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <input
            className="w-full bg-transparent p-3 text-center text-2xl font-semibold"
            value={currentQuestion.text}
            onChange={(e) => updateQuestionText(e.target.value)}
            placeholder="Your question here"
          />
          <div className="mt-4 flex items-center justify-center gap-2">
            <label className="text-sm font-medium text-gray-500">
              Time Limit (seconds):
            </label>
            <input
              type="number"
              min={5}
              max={300}
              className="w-24 rounded border p-1 text-center"
              value={currentQuestion.timeLimit}
              onChange={(e) => updateQuestionTimeLimit(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 text-center shadow">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-md border-2 border-dashed bg-gray-50 p-6">
              <div className="flex h-40 items-center justify-center text-gray-400">
                Find and insert media
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Upload file or drag here to upload
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.answers.map((a) => (
            <div key={a.id} className={`relative text-white`}>
              <div
                className={`flex items-center overflow-hidden rounded-lg ${a.color}`}
              >
                <div className="flex w-16 items-center justify-center gap-4 bg-black/10 px-4 py-6 text-xl">
                  <div className="text-white">{renderIcon(a.shape)}</div>
                </div>
                <div className="flex-1 p-4">
                  <input
                    value={a.text}
                    onChange={(e) => updateAnswer(a.id, e.target.value)}
                    className="w-full bg-transparent font-medium text-white"
                  />
                </div>
                <div className="px-4">
                  <button
                    onClick={() => toggleCorrect(a.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white ${
                      a.correct ? "bg-white text-green-600" : "bg-transparent"
                    }`}
                  >
                    {a.correct && <Check size={18} />}
                  </button>
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Button
                  onClick={() => removeAnswer(a.id)}
                  className="rounded-full opacity-70 hover:opacity-100"
                  size={"icon-xs"}
                >
                  <X />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={addAnswer}
            className="rounded bg-slate-900 px-4 py-2 text-white"
          >
            Add more answers
          </button>
        </div>
      </main>

      {/* Right sidebar - themes / settings */}
      <aside className="h-fit space-y-4">
        <div className="rounded-xl bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold">Themes</h4>
            <button className="rounded border px-2 py-1 text-sm">Themes</button>
          </div>

          <div className="space-y-3">
            <div className="flex h-28 items-center justify-center rounded bg-linear-to-br from-gray-200 to-gray-300 text-sm">
              Theme preview
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 rounded bg-blue-700"></div>
              <div className="h-12 rounded bg-indigo-700"></div>
              <div className="h-12 rounded bg-emerald-700"></div>
              <div className="h-12 rounded bg-yellow-500"></div>
              <div className="h-12 rounded bg-rose-600"></div>
              <div className="h-12 rounded bg-slate-700"></div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Customize background, add images, or pick pre-made themes.
            </div>
          </div>
        </div>

        <div className="flex justify-end bg-white pl-4">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => router.push("/dashboard/quizes")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateQuiz}
            className="bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700"
          >
            Update Quiz
          </Button>
        </div>
      </aside>
    </div>
  );
}
