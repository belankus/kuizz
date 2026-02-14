"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import Countdown from "./Countdown";
import Question from "./Question";
import Reveal from "./Reveal";
import Leaderboard from "./Leaderboard";
import FinalResult from "./FinalResult";
import LobbyContent from "./LobbyPlayerContent";

type GamePhase =
  | "WAITING"
  | "COUNTDOWN"
  | "QUESTION"
  | "REVEAL"
  | "LEADERBOARD"
  | "FINISHED";

interface GameContainerProps {
  roomCode: string;
}

export default function GameContainer({ roomCode }: GameContainerProps) {
  const [phase, setPhase] = useState<GamePhase>("WAITING");
  const [question, setQuestion] = useState<any>(null);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);

  useEffect(() => {
    socket.connect();

    // join room
    socket.emit("join_room", {
      roomCode,
      nickname: "Budi",
    });

    socket.on("phase_changed", (data) => {
      setPhase(data.phase);
    });

    socket.on("question_started", (data) => {
      setQuestion(data.question);
      setSelected(null);
      setCorrectOptionId(null);
      setPhase("QUESTION");
    });

    socket.on("reveal", (data) => {
      setCorrectOptionId(data.correctOptionId);
      setPhase("REVEAL");
    });

    socket.on("leaderboard", (data) => {
      setRankings(data.rankings);
      setPhase("LEADERBOARD");
    });

    socket.on("game_finished", (data) => {
      setRankings(data.finalRankings);
      setPhase("FINISHED");
    });

    return () => {
      socket.disconnect();
    };
  }, [roomCode]);

  const handleAnswer = (optionId: string) => {
    setSelected(optionId);

    socket.emit("submit_answer", {
      roomCode,
      selectedOptionId: optionId,
    });
  };

  switch (phase) {
    case "COUNTDOWN":
      return <Countdown />;

    case "QUESTION":
      return (
        <Question
          question={question?.question}
          options={question?.options || []}
          questionNumber={1}
          totalQuestions={1}
          timeLeft={question?.timeLimit || 10}
          onSelect={handleAnswer}
        />
      );

    case "REVEAL":
      return (
        <Reveal
          question={question?.question}
          options={question?.options || []}
          correctOptionId={correctOptionId || ""}
          selectedOptionId={selected}
        />
      );

    case "LEADERBOARD":
      return <Leaderboard players={rankings} myName="Budi" />;

    case "FINISHED":
      return <FinalResult players={rankings} myName="Budi" isHost={false} />;

    default:
      return <LobbyContent joinCode={roomCode} />;
  }
}
