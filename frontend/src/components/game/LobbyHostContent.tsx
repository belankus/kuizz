"use client";

import { useEffect, useState } from "react";
import QRCodePlaceholder from "@/components/game/QRCodePlaceholder";
import Avatar from "@/components/avatar/Avatar";
import { getConsistentAvatar } from "@/components/avatar/AvatarBuilder";
import { Lock, Unlock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { socket } from "@/lib/socket";
import { AvatarModel, PlayerModel } from "@/types";
import { useTranslations } from "next-intl";
import { useAudioManager } from "@/lib/useAudioManager";

interface LobbyContentInterface {
  joinCode: string;
  players: PlayerModel[];
  initialIsLocked?: boolean;
}

export default function LobbyContent({
  joinCode,
  players,
  initialIsLocked = false,
}: LobbyContentInterface) {
  const t = useTranslations("Game");
  const { playLobbyBgm, playClick, stopAll } = useAudioManager();
  const [isLocked, setIsLocked] = useState<boolean>(initialIsLocked);

  useEffect(() => {
    playLobbyBgm();

    return stopAll;
  }, [playLobbyBgm, stopAll]);

  useEffect(() => {
    setIsLocked(initialIsLocked);
  }, [initialIsLocked]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onRoomLockChanged = (data: { isLocked: boolean }) => {
      setIsLocked(data.isLocked);
    };

    socket.on("room_lock_changed", onRoomLockChanged);

    return () => {
      socket.off("room_lock_changed", onRoomLockChanged);
    };
  }, []);

  const toggleLock = () => {
    playClick();
    const hostToken = localStorage.getItem("hostToken");
    if (!hostToken) return;

    socket.emit("toggle_lock_room", {
      roomCode: joinCode,
      hostToken,
    });
  };

  const startGame = () => {
    playClick();
    const hostToken = localStorage.getItem("hostToken");

    socket?.emit("host_start_game", {
      roomCode: joinCode,
      hostToken,
    });
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-linear-to-br from-blue-800 via-blue-700 to-blue-900 text-white">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs sm:text-sm opacity-90">
              {t("joinAt")} <span className="font-semibold">kuizz.my.id</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm shadow ${
                      isLocked ? "bg-red-700 hover:bg-red-800" : "bg-white/10 hover:bg-white/20"
                    }`}
                    onClick={toggleLock}
                  >
                    {isLocked ? <Lock width={16} /> : <Unlock width={16} />}
                    <span>{isLocked ? t("locked") : t("unlocked")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isLocked ? t("gameLocked") : t("gameUnlocked")}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  {players.length < 1 ? (
                    <span className="inline-block w-fit">
                      <Button
                        className="rounded-lg bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-blue-800 shadow hover:bg-white/80 disabled:bg-white/80"
                        disabled={players.length < 1}
                      >
                        {t("start")}
                      </Button>
                    </span>
                  ) : (
                    <Button
                      className="rounded-lg bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-blue-800 shadow hover:bg-white/80 disabled:bg-white/80"
                      onClick={startGame}
                    >
                      {t("start")}
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {players.length < 1
                    ? "Need at least 1 player to start"
                    : t("startGame")}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Central Card PIN & QR Code */}
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl bg-white/5 p-4 sm:p-6 backdrop-blur-md">
            <div className="text-center sm:text-left">
              <div className="text-xs sm:text-sm tracking-wide uppercase opacity-90">
                {t("gamePin")}
              </div>
              <div className="mt-1 sm:mt-2 text-4xl sm:text-6xl font-extrabold tracking-widest">
                {joinCode}
              </div>
              <div className="mt-1 text-xs sm:text-sm opacity-90">
                {t("askPlayersToGo")}{" "}
                <span className="font-semibold">kuizz.live</span>{" "}
                {t("andEnterPin")}
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="inline-block rounded-md bg-white p-2 sm:p-3">
                  <QRCodePlaceholder joinCode={joinCode} />
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold">{players.length}</div>
                <div className="text-xs sm:text-sm opacity-90">{t("participantsJoined")}</div>
              </div>
            </div>
          </div>

          {/* Participants section */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center">
            <div className="rounded-full bg-white/10 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-lg text-white">
              {t("waitingForParticipants")}
            </div>

            <div className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {players.map((player, index) => {
                const avatarCfg: AvatarModel =
                  player.avatar ?? getConsistentAvatar(player.nickname);
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="animate-[pulse_2s_ease-in-out_infinite] overflow-hidden rounded-full ring-4 ring-white/30">
                      <Avatar config={avatarCfg} size={56} />
                    </div>
                    <h3 className="mt-2 text-xs sm:text-sm font-semibold">
                      {player.nickname}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="mt-8 flex w-full max-w-4xl items-center justify-between gap-3">

          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs sm:text-sm text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14"
              />
            </svg>
            <span>{players.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}