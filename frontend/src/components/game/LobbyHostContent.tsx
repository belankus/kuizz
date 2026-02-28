"use client";

import { useEffect, useState, useMemo } from "react";
import QRCodePlaceholder from "@/components/game/QRCodePlaceholder";
import Avatar from "@/components/avatar/Avatar";
import { getConsistentAvatar } from "@/components/avatar/AvatarBuilder";
import type { AvatarConfig } from "@/components/avatar/AvatarBuilder";
import { Lock, Unlock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { socket } from "@/lib/socket";

interface LobbyContentInterface {
  joinCode: string;
  players: any[];
  initialIsLocked?: boolean;
}

export default function LobbyContent({
  joinCode,
  players,
  initialIsLocked = false,
}: LobbyContentInterface) {
  const [isLocked, setIsLocked] = useState<boolean>(initialIsLocked);

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
      // tidak disconnect di sini agar socket tetap terhubung untuk game
    };
  }, []);

  const toggleLock = () => {
    const hostToken = localStorage.getItem("hostToken");
    if (!hostToken) return;

    socket.emit("toggle_lock_room", {
      roomCode: joinCode,
      hostToken,
    });
  };

  const startGame = () => {
    const hostToken = localStorage.getItem("hostToken");

    socket?.emit("host_start_game", {
      roomCode: joinCode,
      hostToken,
    });
  };

  return (
    <>
      {/* Full-bleed hero-style lobby similar to Kahoot */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-800 via-blue-700 to-blue-900"></div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start px-6 pt-12 text-white">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">
              Join at <span className="font-semibold">kuizz.my.id</span>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 shadow ${isLocked ? "bg-red-700 hover:bg-red-800" : "bg-white/10 hover:bg-white/20"}`}
                    onClick={toggleLock}
                  >
                    {isLocked ? <Lock width={18} /> : <Unlock width={18} />}
                    <span>{isLocked ? "Locked" : "Unlocked"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isLocked ? "Game is Locked" : "Game is Unlocked"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  {players.length < 1 ? (
                    <span className="inline-block w-fit">
                      <Button
                        className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-800 shadow hover:bg-white/80 disabled:bg-white/80"
                        disabled={players.length < 1}
                      >
                        Start
                      </Button>
                    </span>
                  ) : (
                    <Button
                      className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-800 shadow hover:bg-white/80 disabled:bg-white/80"
                      onClick={startGame}
                    >
                      Start
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {players.length < 1
                    ? "Need at least 1 player to start"
                    : "Start the game"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between rounded-lg bg-white/5 p-6">
            <div>
              <div className="text-sm tracking-wide uppercase opacity-90">
                Game PIN
              </div>
              <div className="mt-2 text-6xl font-extrabold tracking-widest">
                {joinCode}
              </div>
              <div className="mt-1 text-sm opacity-90">
                Ask players to go to{" "}
                <span className="font-semibold">kuizz.live</span> and enter the
                PIN
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="inline-block rounded-md bg-white p-3">
                  <QRCodePlaceholder joinCode={joinCode} />
                </div>
              </div>

              <div className="text-right">
                <div className="mt-1 text-3xl font-bold">{players.length}</div>
                <div className="text-sm opacity-90">Participants Joined</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center">
            <div className="rounded-full bg-white/10 px-6 py-3 text-lg text-white">
              Waiting for participants
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {players.map((player, index) => {
                const avatarCfg: AvatarConfig =
                  player.avatar ?? getConsistentAvatar(player.nickname);
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="animate-[pulse_2s_ease-in-out_infinite] overflow-hidden rounded-full ring-4 ring-white/30">
                      <Avatar config={avatarCfg} size={64} />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold">
                      {player.nickname}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* bottom-right controls similar to Kahoot */}
      <div className="absolute right-6 bottom-6 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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

        <button className="rounded-lg bg-white/10 px-3 py-2 text-white">
          ⚙
        </button>
      </div>
    </>
  );
}
