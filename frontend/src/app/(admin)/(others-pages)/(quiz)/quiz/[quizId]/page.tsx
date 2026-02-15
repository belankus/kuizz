"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPage() {
  const { quizId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`http://localhost:3000/quiz/${quizId}`);
        const data = await res.json();

        const question = data.questions[0];

        setTitle(question.text);

        setAnswers(
          question.options.map((o: any, index: number) => ({
            id: o.id,
            text: o.text,
            correct: o.isCorrect,
            color: [
              "bg-red-600",
              "bg-blue-600",
              "bg-yellow-500",
              "bg-green-600",
            ][index % 4],
            shape: ["▲", "◆", "●", "■"][index % 4],
          })),
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push("/quizes");
      }
    }

    fetchQuiz();
  }, [quizId]);

  async function updateQuiz() {
    const validAnswers = answers.filter((a) => a.text.trim() !== "");

    if (!validAnswers.some((a) => a.correct)) {
      Swal.fire("Error", "Select at least 1 correct answer", "warning");
      return;
    }

    const payload = {
      title,
      questions: [
        {
          text: title,
          timeLimit: 20,
          options: validAnswers.map((a) => ({
            text: a.text,
            isCorrect: a.correct,
          })),
        },
      ],
    };

    try {
      const res = await fetch(`http://localhost:3000/quiz/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      await Swal.fire({
        icon: "success",
        title: "Quiz Updated",
        timer: 1200,
        showConfirmButton: false,
      });

      router.push("/quizes");
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  }

  function toggleCorrect(id: number) {
    setAnswers(
      answers.map((a) => (a.id === id ? { ...a, correct: !a.correct } : a)),
    );
  }

  function updateText(id: number, text: string) {
    setAnswers(answers.map((a) => (a.id === id ? { ...a, text } : a)));
  }

  function addAnswer() {
    const id = answers.length ? Math.max(...answers.map((a) => a.id)) + 1 : 1;
    const palette = [
      "bg-red-600",
      "bg-blue-600",
      "bg-yellow-500",
      "bg-green-600",
      "bg-purple-600",
    ];
    setAnswers([
      ...answers,
      {
        id,
        text: "New answer",
        color: palette[id % palette.length],
        shape: "◆",
        correct: false,
      },
    ]);
  }

  return (
    <div className="grid min-h-[80vh] grid-cols-[220px_1fr_320px] gap-6">
      {/* Left sidebar - question list */}
      <aside className="h-fit rounded-xl bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Quiz</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-indigo-50">
              1
            </div>
            <div className="truncate text-sm">{title}</div>
          </div>

          <button className="w-full rounded bg-blue-600 px-3 py-2 text-white">
            + Add
          </button>
          <button className="w-full rounded border border-dashed px-3 py-2 text-sm">
            Generate
          </button>
        </div>
      </aside>

      {/* Main editor area */}
      <main className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <input
            className="w-full bg-transparent p-3 text-center text-2xl font-semibold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
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
          {answers.map((a) => (
            <div
              key={a.id}
              className={`flex items-center overflow-hidden rounded-lg ${a.color} text-white`}
            >
              <div className="flex w-16 items-center justify-center gap-4 bg-black/10 px-4 py-6 text-xl">
                <div className="text-2xl">{a.shape}</div>
              </div>
              <div className="flex-1 p-4">
                <input
                  value={a.text}
                  onChange={(e) => updateText(a.id, e.target.value)}
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
                  ✓
                </button>
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

          <button
            onClick={updateQuiz}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Save Changes
          </button>
        </div>
      </main>

      {/* Right sidebar - themes / settings */}
      <aside className="h-fit rounded-xl bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold">Themes</h4>
          <button className="rounded border px-2 py-1 text-sm">Themes</button>
        </div>

        <div className="space-y-3">
          <div className="flex h-28 items-center justify-center rounded bg-gradient-to-br from-gray-200 to-gray-300 text-sm">
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
      </aside>
    </div>
  );
}
