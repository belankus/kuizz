"use client";

import { useEffect, useState, useRef } from "react";
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
import { useRouter } from "next/navigation";
import { PlayerModel } from "@/types";

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

interface CurrentQuestion {
  question: string;
  timeLimit: number;
  options: { id: string; text: string }[];
}

export default function GameContainer({ roomCode }: GameContainerProps) {
  const [phase, setPhase] = useState<GamePhase>("WAITING");
  const [question, setQuestion] = useState<CurrentQuestion | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [players, setPlayers] = useState<PlayerModel[]>([]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [rankings, setRankings] = useState<PlayerModel[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>("Kuizz Game");
  const prevRankingsRef = useRef<PlayerModel[]>([]);
  const playersRef = useRef<PlayerModel[]>([]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const [nickname, setNickname] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(
    null,
  );
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [now, setNow] = useState(Date.now());
  const router = useRouter();

  const handleLeaveGame = () => {
    localStorage.removeItem("guestAvatar");
    localStorage.removeItem("playerToken");
    localStorage.removeItem("hostToken");
    localStorage.removeItem("roomCode");
    localStorage.removeItem("hostRoom");
    router.push("/");
  };

  const handleAbortGame = () => {
    if (
      confirm("Are you sure you want to end the game early for all players?")
    ) {
      socket.emit("abort_game", {
        roomCode,
        hostToken,
      });
    }
  };

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
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.title) setQuizTitle(data.title);
      if (data.correctOptionIds) setCorrectOptionIds(data.correctOptionIds);
      else if (data.correctOptionId)
        setCorrectOptionIds([data.correctOptionId]);
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
      setCorrectOptionIds([]);
      setAnswerStats({}); // 🔥 reset stats
      setPhase("QUESTION");
    });

    socket.on("reveal", (data) => {
      setCorrectOptionIds(data.correctOptionIds || []);
      setPhase("REVEAL");
    });

    socket.on("leaderboard", (data) => {
      setRankings((prev) => {
        let oldRankings = prev;
        if (!oldRankings || oldRankings.length === 0) {
          oldRankings = playersRef.current.map((p) => ({
            ...p,
            score: 0,
          }));
        }
        prevRankingsRef.current = oldRankings;
        return data.rankings;
      });
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

  const timeLeft =
    questionStartTime && question
      ? Math.max(
          0,
          Math.ceil(
            (question.timeLimit * 1000 - (now - questionStartTime)) / 1000,
          ),
        )
      : 0;

  const remainingMs =
    questionStartTime && question
      ? Math.max(0, question.timeLimit * 1000 - (now - questionStartTime))
      : 0;

  const handleAnswer = (optionId: string) => {
    setSelected(optionId);

    socket.emit("submit_answer", {
      roomCode,
      selectedOptionId: optionId,
    });
  };

  const rankingsToUse =
    rankings.length > 0 ? rankings : prevRankingsRef.current;
  const me = rankingsToUse.find((p) => p.nickname === nickname);
  const myScore = me ? me.score : 0;
  const myRankIndex = rankingsToUse.findIndex((p) => p.nickname === nickname);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : 0;

  return (
    <div className="relative min-h-screen">
      {isHost &&
        phase !== "FINISHED" &&
        phase !== "QUESTION" &&
        phase !== "REVEAL" && (
          <button
            onClick={handleAbortGame}
            className="absolute top-4 right-4 z-50 rounded-lg bg-red-600/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-red-600/40"
          >
            End Game
          </button>
        )}
      {(() => {
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
                correctOptionId={correctOptionIds[0] || ""}
                correctOptionIds={correctOptionIds}
                phase={phase}
                topic={quizTitle}
                onEndQuestion={() =>
                  socket.emit("force_reveal", {
                    roomCode,
                    hostToken,
                  })
                }
                onSkipQuestion={() =>
                  socket.emit("force_reveal", {
                    roomCode,
                    hostToken,
                  })
                }
                roomCode={roomCode}
                currentQuestionIndex={currentIndex}
                totalQuestions={totalQuestions}
                onEndGame={handleAbortGame}
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
                topic={quizTitle}
                score={myScore}
                rank={myRank}
                playerName={nickname || "Player"}
                avatar={me?.avatar}
              />
            );

          case "REVEAL":
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
                correctOptionId={correctOptionIds[0] || ""}
                correctOptionIds={correctOptionIds}
                phase={phase}
                topic={quizTitle}
                onEndQuestion={() =>
                  socket.emit("force_reveal", {
                    roomCode,
                    hostToken,
                  })
                }
                onSkipQuestion={() =>
                  socket.emit("force_reveal", {
                    roomCode,
                    hostToken,
                  })
                }
                roomCode={roomCode}
                currentQuestionIndex={currentIndex}
                totalQuestions={totalQuestions}
                onEndGame={handleAbortGame}
              />
            ) : (
              <Reveal
                question={question.question}
                options={question.options}
                correctOptionIds={correctOptionIds}
                selectedOptionId={selected}
              />
            );

          case "LEADERBOARD":
            return (
              <Leaderboard
                players={rankings}
                prevPlayers={prevRankingsRef.current}
                myName={nickname}
              />
            );

          case "FINISHED":
            return (
              <FinalResult
                players={rankings}
                myName={nickname}
                isHost={isHost}
                sessionId={sessionId}
                onPlayAgain={handleLeaveGame}
              />
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
      })()}
    </div>
  );
}
