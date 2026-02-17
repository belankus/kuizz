"use client";

import Question from "@/components/game/Question";

interface Question {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  timeLimit: number; // seconds
}

const question: Question = {
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

const timeLeft = 10;
const remainingMs = timeLeft * 1000;
const currentIndex = 0;
const totalQuestions = 5;

const handleAnswer = (optionId: string) => {
  console.log("Selected option:", optionId);
};
export default function QuestionPage() {
  return (
    <Question
      question={question.question}
      options={question.options || []}
      timeLeft={timeLeft}
      totalTime={question.timeLimit}
      remainingMs={remainingMs}
      questionNumber={currentIndex + 1}
      totalQuestions={totalQuestions}
      onSelect={handleAnswer}
    />
  );
}
