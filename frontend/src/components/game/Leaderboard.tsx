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

interface LeaderboardProps {
  players: Player[];
  myName: string | null;
}

export default function Leaderboard({ players, myName }: LeaderboardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-purple-800 via-indigo-700 to-blue-900 px-6 text-white">
      <h1 className="mb-10 text-4xl font-bold">Leaderboard</h1>

      <div className="w-full max-w-3xl space-y-3">
        {players.map((player, index) => {
          const isMe = player.nickname === myName;
          const avatarCfg: AvatarConfig = player.avatar ?? getRandomAvatar();
          const rankEmoji =
            index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
          return (
            <div
              key={index}
              className={`flex items-center justify-between rounded-xl px-5 py-3 shadow transition-transform ${
                isMe ? "scale-[1.02] bg-yellow-400 text-black" : "bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 text-center text-xl font-bold">
                  {rankEmoji ?? <span className="text-base">{index + 1}</span>}
                </div>
                <div
                  className={`overflow-hidden rounded-full ${isMe ? "ring-2 ring-black/30" : "ring-2 ring-white/20"}`}
                >
                  <AvatarDisplay config={avatarCfg} size={44} />
                </div>
                <div className="text-base font-semibold">{player.nickname}</div>
              </div>
              <div className="text-base font-bold">{player.score} pts</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
