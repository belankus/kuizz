"use client";

import HostQuestion from "@/components/game/HostQuestion";

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

const timeLeft = 10;
const remainingMs = timeLeft * 1000;
const answerStats = {
  correct: 0,
  incorrect: 0,
  skipped: 0,
};
const players = Array.from({ length: 42 }).map((_, i) => ({
  id: `p${i}`,
  name: `Player ${i}`,
}));
const correctOptionIds = ["o3"];
const phase = "QUESTION";

export default function HostQuestionPage() {
  return (
    <HostQuestion
      question={question.question}
      options={question.options}
      timeLeft={timeLeft}
      totalTime={question.timeLimit}
      remainingMs={remainingMs}
      answerStats={answerStats}
      totalPlayers={players.length}
      correctOptionId={correctOptionIds[0] || ""}
      correctOptionIds={correctOptionIds}
      phase={phase}
      onEndQuestion={() => console.log("End Question")}
      onSkipQuestion={() => console.log("Skip Question")}
      roomCode="882941"
      currentQuestionIndex={3}
      totalQuestions={12}
      onEndGame={() => console.log("End Game")}
    />
  );
}
