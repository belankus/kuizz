"use client";

import React, { useState } from "react";

export default function CreatePage() {
  const [title, setTitle] = useState("Apa yang tidak termasuk akhlak?");
  const [answers, setAnswers] = useState([
    { id: 1, text: "Amanah", color: "bg-red-600", shape: "▲", correct: false },
    {
      id: 2,
      text: "Kompeten",
      color: "bg-blue-600",
      shape: "◆",
      correct: false,
    },
    {
      id: 3,
      text: "Harmonis",
      color: "bg-yellow-500",
      shape: "●",
      correct: false,
    },
    { id: 4, text: "Loyo", color: "bg-green-600", shape: "■", correct: true },
  ]);

  function toggleCorrect(id: number) {
    setAnswers(
      answers.map((a) => (a.id === id ? { ...a, correct: !a.correct } : a))
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
    <div className="min-h-[80vh] grid grid-cols-[220px_1fr_320px] gap-6">
      {/* Left sidebar - question list */}
      <aside className="bg-white rounded-xl p-4 shadow h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Quiz</h3>
        </div>

        <div className="space-y-3">
          <div className="p-3 border rounded flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-50 rounded flex items-center justify-center">
              1
            </div>
            <div className="text-sm truncate">{title}</div>
          </div>

          <button className="w-full px-3 py-2 bg-blue-600 text-white rounded">
            + Add
          </button>
          <button className="w-full px-3 py-2 border border-dashed rounded text-sm">
            Generate
          </button>
        </div>
      </aside>

      {/* Main editor area */}
      <main className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <input
            className="w-full text-center text-2xl font-semibold p-3 bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow text-center">
          <div className="mx-auto max-w-2xl">
            <div className="border-2 border-dashed rounded-md p-6 bg-gray-50">
              <div className="h-40 flex items-center justify-center text-gray-400">
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
              className={`rounded-lg overflow-hidden flex items-center ${a.color} text-white`}
            >
              <div className="px-4 py-6 flex items-center gap-4 w-16 justify-center text-xl bg-black/10">
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
                  className={`h-10 w-10 rounded-full border-2 border-white flex items-center justify-center ${
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
            className="px-4 py-2 rounded bg-slate-900 text-white"
          >
            Add more answers
          </button>
        </div>
      </main>

      {/* Right sidebar - themes / settings */}
      <aside className="bg-white rounded-xl p-4 shadow h-fit">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Themes</h4>
          <button className="text-sm px-2 py-1 border rounded">Themes</button>
        </div>

        <div className="space-y-3">
          <div className="h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center text-sm">
            Theme preview
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 bg-blue-700 rounded"></div>
            <div className="h-12 bg-indigo-700 rounded"></div>
            <div className="h-12 bg-emerald-700 rounded"></div>
            <div className="h-12 bg-yellow-500 rounded"></div>
            <div className="h-12 bg-rose-600 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Customize background, add images, or pick pre-made themes.
          </div>
        </div>
      </aside>
    </div>
  );
}
