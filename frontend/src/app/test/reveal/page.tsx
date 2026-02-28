"use client";

import Reveal from "@/components/game/Reveal";

const question = {
  id: "q1",
  question: "What is the capital of France?",
  options: [
    { id: "o1", text: "Berlin" },
    { id: "o2", text: "Madrid" },
    { id: "o3", text: "Paris" },
    { id: "o4", text: "Rome" },
  ],
  correctOptionId: "o3",
  timeLimit: 15,
};

const correctOptionIds = ["o3"];
const selected = "o1";

export default function HostRevealPage() {
  return (
    <Reveal
      question={question?.question}
      options={question?.options || []}
      correctOptionIds={correctOptionIds}
      selectedOptionId={selected}
    />
  );
}
