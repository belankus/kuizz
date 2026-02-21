"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import Countdown from "./Countdown";
import Question from "./Question";
import Reveal from "./Reveal";
import Leaderboard from "./Leaderboard";
import FinalResult from "./FinalResult";
import LobbyContentHost from "./LobbyHostContent";
import LobbyContentPlayer from "./LobbyPlayerContent";
import RoomNotFound from "./fallback/RoomNotFound";
import GameAlreadyStarted from "./fallback/GameAlreadyStarted";
import RoomLocked from "./fallback/RoomLocked";
import HostQuestion from "./HostQuestion";

type GamePhase =
  | "WAITING"
  | "COUNTDOWN"
  | "QUESTION"
  | "REVEAL"
  | "LEADERBOARD"
  | "FINISHED"
  | "ROOM_NOT_FOUND"
  | "ROOM_LOCKED"
  | "GAME_ALREADY_STARTED";

interface GameContainerProps {
  roomCode: string;
}

export default function GameContainer({ roomCode }: GameContainerProps) {
  const [phase, setPhase] = useState<GamePhase>("WAITING");
  const [question, setQuestion] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [players, setPlayers] = useState<any[]>([]);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(
    null,
  );
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    const storedRoom = localStorage.getItem("roomCode");
    const playerToken = localStorage.getItem("playerToken");
    const hostToken = localStorage.getItem("hostToken");
    const hostRoom = localStorage.getItem("hostRoom");
    const isHost = !!hostToken && hostRoom === roomCode;

    if (!isHost) {
      if (!storedNickname || storedRoom !== roomCode) {
        window.location.href = `/join?roomId=${roomCode}`;
        return;
      }
    }

    setHostToken(hostToken);
    setIsHost(isHost);
    setNickname(storedNickname);

    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      if (!isHost) {
        socket.emit("join_room", {
          roomCode,
          nickname: storedNickname,
          playerToken,
        });
      }

      socket.emit("get_current_state", {
        roomCode,
      });
    });

    socket.on("host_registered", (data) => {
      localStorage.setItem("hostToken", data.hostToken);
    });

    socket.on("player_registered", (data) => {
      localStorage.setItem("playerToken", data.playerToken);
    });

    socket.on("current_state", (data) => {
      setPhase(data.phase);

      if (data.isLocked !== undefined) setIsLocked(data.isLocked);
      if (data.players) setPlayers(data.players);
      if (data.question) setQuestion(data.question);
      if (data.correctOptionId) setCorrectOptionId(data.correctOptionId);
      if (data.rankings) setRankings(data.rankings);
    });

    socket.on("room_not_found", () => {
      setPhase("ROOM_NOT_FOUND");
    });

    socket.on("room_locked", () => {
      setPhase("ROOM_LOCKED");
    });

    socket.on("room_lock_changed", (data) => {
      setIsLocked(data.isLocked);
    });

    socket.on("game_already_started", () => {
      setPhase("GAME_ALREADY_STARTED");
    });

    socket.on("phase_changed", (data) => {
      setPhase(data.phase);
    });

    socket.on("question_started", (data) => {
      setQuestion(data.question);
      setQuestionStartTime(data.startTime);
      setCurrentIndex(data.currentIndex);
      setTotalQuestions(data.totalQuestions);

      setSelected(null);
      setCorrectOptionId(null);
      setAnswerStats({}); // 🔥 reset stats
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

    socket.on("player_joined", (data) => {
      setPlayers(data.players);
    });

    socket.on("answer_stats", (data) => {
      setAnswerStats(data.stats);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [roomCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const timeLeft = questionStartTime
    ? Math.max(
        0,
        Math.ceil(
          (question.timeLimit * 1000 - (now - questionStartTime)) / 1000,
        ),
      )
    : 0;

  const remainingMs = questionStartTime
    ? Math.max(0, question.timeLimit * 1000 - (now - questionStartTime))
    : 0;

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
      if (!question) return null;

      return isHost ? (
        <HostQuestion
          question={question.question}
          options={question.options}
          timeLeft={timeLeft}
          totalTime={question.timeLimit}
          remainingMs={remainingMs}
          answerStats={answerStats}
          totalPlayers={players.length}
          correctOptionId={correctOptionId}
          phase={phase}
          onEndQuestion={() =>
            socket.emit("force_reveal", {
              roomCode,
              hostToken,
            })
          }
        />
      ) : (
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

    case "REVEAL":
      return isHost ? (
        <HostQuestion
          question={question.question}
          options={question.options}
          timeLeft={timeLeft}
          totalTime={question.timeLimit}
          remainingMs={remainingMs}
          answerStats={answerStats}
          totalPlayers={players.length}
          correctOptionId={correctOptionId}
          phase={phase}
          onEndQuestion={() =>
            socket.emit("force_reveal", {
              roomCode,
              hostToken,
            })
          }
        />
      ) : (
        <Reveal
          question={question?.question}
          options={question?.options || []}
          correctOptionId={correctOptionId || ""}
          selectedOptionId={selected}
        />
      );

    case "LEADERBOARD":
      return <Leaderboard players={rankings} myName={nickname} />;

    case "FINISHED":
      return (
        <FinalResult players={rankings} myName={nickname} isHost={false} />
      );

    case "ROOM_NOT_FOUND":
      return <RoomNotFound />;

    case "GAME_ALREADY_STARTED":
      return <GameAlreadyStarted />;

    case "ROOM_LOCKED":
      return <RoomLocked />;

    default:
      return isHost ? (
        <LobbyContentHost
          players={players}
          joinCode={roomCode}
          initialIsLocked={isLocked}
        />
      ) : (
        <LobbyContentPlayer
          players={players}
          joinCode={roomCode}
          nickname={nickname}
        />
      );
  }
}
