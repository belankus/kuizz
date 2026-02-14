"use client";

import { useEffect, useState } from "react";
import Countdown from "./Countdown";
import Question from "./Question";
import Reveal from "./Reveal";
import Leaderboard from "./Leaderboard";
import FinalResult from "./FinalResult";

type GamePhase =
  | "COUNTDOWN"
  | "QUESTION"
  | "REVEAL"
  | "LEADERBOARD"
  | "FINISHED";

interface GameContainerProps {
  roomCode: string;
}

export default function GameContainer({ roomCode }: GameContainerProps) {
  const [phase, setPhase] = useState<GamePhase>("COUNTDOWN");
  const [selected, setSelected] = useState<string | null>(null);

  const totalQuestions = 3; // contoh
  const [currentIndex, setCurrentIndex] = useState(0);

  // dummy question data
  const question = {
    text: "What is the capital of France?",
    options: [
      { id: "1", text: "London" },
      { id: "2", text: "Berlin" },
      { id: "3", text: "Paris" },
      { id: "4", text: "Madrid" },
    ],
    correctOptionId: "3",
  };

  useEffect(() => {
    if (phase === "COUNTDOWN") {
      const t = setTimeout(() => setPhase("QUESTION"), 3500);
      return () => clearTimeout(t);
    }

    if (phase === "REVEAL") {
      const t = setTimeout(() => setPhase("LEADERBOARD"), 3000);
      return () => clearTimeout(t);
    }

    if (phase === "LEADERBOARD") {
      const t = setTimeout(() => {
        const isLastQuestion = currentIndex === totalQuestions - 1;

        if (isLastQuestion) {
          setPhase("FINISHED");
        } else {
          setCurrentIndex((prev) => prev + 1);
          setPhase("QUESTION");
        }
      }, 3000);

      return () => clearTimeout(t);
    }
  }, [phase, currentIndex]);

  switch (phase) {
    case "COUNTDOWN":
      return <Countdown />;

    case "QUESTION":
      return (
        <Question
          question={question.text}
          options={question.options}
          questionNumber={1}
          totalQuestions={10}
          timeLeft={30}
          onSelect={(id) => {
            setSelected(id);
            setTimeout(() => setPhase("REVEAL"), 1000);
          }}
        />
      );

    case "REVEAL":
      return (
        <Reveal
          question={question.text}
          options={question.options}
          correctOptionId={question.correctOptionId}
          selectedOptionId={selected}
        />
      );

    case "LEADERBOARD":
      return (
        <Leaderboard
          players={[
            { name: "Ardi", score: 1200 },
            { name: "Shinta", score: 950 },
            { name: "Budi", score: 870 },
          ]}
          myName="Budi"
        />
      );

    case "FINISHED":
      return (
        <FinalResult
          players={[
            { name: "Ardi", score: 2500 },
            { name: "Shinta", score: 2100 },
            { name: "Budi", score: 1800 },
            { name: "Rina", score: 1600 },
          ]}
          myName="Budi"
          isHost={false}
          onPlayAgain={() => setPhase("COUNTDOWN")}
        />
      );

    default:
      return null;
  }
}
