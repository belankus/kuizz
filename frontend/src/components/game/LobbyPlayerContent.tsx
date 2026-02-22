"use client";

import {
  AvatarDisplay,
  getConsistentAvatar,
} from "@/components/avatar/AvatarBuilder";
import type { AvatarConfig } from "@/components/avatar/AvatarBuilder";

interface LobbyContentInterface {
  joinCode: string;
  nickname: string | null;
  players: any[];
}

import { useEffect, useState } from "react";

export default function LobbyPlayer({
  nickname,
  players,
}: LobbyContentInterface) {
  const [localAvatar, setLocalAvatar] = useState<AvatarConfig | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("guestAvatar");
    if (stored) {
      try {
        setLocalAvatar(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const isLocked = false;

  return (
    <>
      <div className="absolute inset-0 bg-linear-to-br from-blue-800 via-blue-700 to-blue-900"></div>

      <div className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 text-white">
        <div className="w-full max-w-3xl text-center">
          {/* Joined Identity */}
          <div className="text-lg opacity-90">You joined as</div>
          <div className="mt-2 text-3xl font-bold">{nickname}</div>

          {/* Status */}
          <div className="mt-6 inline-block rounded-full bg-white/10 px-6 py-3 text-lg">
            {isLocked
              ? "Room is locked 🔒"
              : "Waiting for host to start the game"}
          </div>

          {/* Player Count */}
          <div className="mt-10 text-sm opacity-80">
            {players.length} participants in the room
          </div>

          {/* Player List */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {players.map((player, index) => {
              const isMe = player.nickname === nickname;
              const avatarCfg: AvatarConfig =
                player.avatar ??
                (isMe ? localAvatar : null) ??
                getConsistentAvatar(player.nickname);
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center rounded-2xl p-3 transition-transform ${
                    isMe ? "scale-110" : ""
                  }`}
                >
                  <div
                    className={`overflow-hidden rounded-full ${
                      isMe
                        ? "ring-4 ring-yellow-300 ring-offset-2 ring-offset-blue-800"
                        : "ring-2 ring-white/20"
                    }`}
                  >
                    <AvatarDisplay config={avatarCfg} size={64} />
                  </div>
                  <h3
                    className={`mt-2 text-sm font-semibold ${
                      isMe ? "text-yellow-300" : ""
                    }`}
                  >
                    {isMe ? `✨ ${player.nickname}` : player.nickname}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* Fun animation / idle state */}
          <div className="mt-12 animate-pulse text-sm opacity-60">
            Get ready...
          </div>
        </div>
      </div>
    </>
  );
}
