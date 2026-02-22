"use client";

import {
  AvatarDisplay,
  getRandomAvatar,
} from "@/components/avatar/AvatarBuilder";
import type { AvatarConfig } from "@/components/avatar/AvatarBuilder";

interface Player {
  nickname: string;
  score: number;
  avatar?: AvatarConfig | null;
}

interface FinalResultProps {
  players: Player[];
  myName: string | null;
  isHost: boolean;
  onPlayAgain?: () => void;
}

export default function FinalResult({
  players,
  myName,
  isHost,
  onPlayAgain,
}: FinalResultProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const topThree = sorted.slice(0, 3);

  const myRank = sorted.findIndex((p) => p.nickname === myName) + 1;

  return (
    <div className="flex min-h-screen flex-col items-center bg-linear-to-br from-purple-800 via-indigo-700 to-blue-900 px-6 py-16 text-white">
      <h1 className="mb-12 text-4xl font-bold">🎉 Game Finished!</h1>

      {/* Podium */}
      <div className="flex items-end justify-center gap-6">
        {topThree[1] && <PodiumCard player={topThree[1]} position={2} />}
        {topThree[0] && <PodiumCard player={topThree[0]} position={1} />}
        {topThree[2] && <PodiumCard player={topThree[2]} position={3} />}
      </div>

      {/* My Result */}
      {myName && (
        <div className="mt-10 rounded-full bg-white/10 px-6 py-3 text-lg">
          You finished <span className="font-bold">#{myRank}</span>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="mt-10 w-full max-w-3xl space-y-3">
        {sorted.map((player, index) => {
          const isMe = player.nickname === myName;
          const avatarCfg: AvatarConfig = player.avatar ?? getRandomAvatar();
          return (
            <div
              key={index}
              className={`flex items-center justify-between rounded-xl px-5 py-3 ${
                isMe ? "bg-yellow-400 text-black" : "bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-6 text-center font-bold">{index + 1}</span>
                <div
                  className={`overflow-hidden rounded-full ${isMe ? "ring-2 ring-black/30" : "ring-2 ring-white/20"}`}
                >
                  <AvatarDisplay config={avatarCfg} size={40} />
                </div>
                <span className="font-semibold">{player.nickname}</span>
              </div>
              <span className="font-bold">{player.score} pts</span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-12">
        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 shadow hover:bg-white/80"
          >
            Play Again
          </button>
        ) : (
          <div className="text-sm opacity-70">Waiting for host...</div>
        )}
      </div>
    </div>
  );
}

function PodiumCard({
  player,
  position,
}: {
  player: Player;
  position: number;
}) {
  const height = position === 1 ? "h-40" : position === 2 ? "h-32" : "h-28";
  const medal = position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉";
  const avatarCfg: AvatarConfig = player.avatar ?? getRandomAvatar();

  return (
    <div className="flex flex-col items-center">
      {/* Avatar above podium */}
      <div
        className={`mb-2 overflow-hidden rounded-full ring-4 ${
          position === 1
            ? "ring-yellow-400"
            : position === 2
              ? "ring-gray-300"
              : "ring-amber-600"
        }`}
      >
        <AvatarDisplay config={avatarCfg} size={position === 1 ? 72 : 56} />
      </div>
      <div className="mb-1 text-2xl">{medal}</div>
      <div
        className={`flex w-24 flex-col items-center justify-end rounded-t-lg bg-white/20 ${height}`}
      >
        <div className="pb-3 text-center">
          <div className="text-xs leading-tight font-bold">
            {player.nickname}
          </div>
          <div className="text-sm opacity-80">{player.score}</div>
        </div>
      </div>
    </div>
  );
}
