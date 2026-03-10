import Avatar from "@/components/avatar/Avatar";
import { getConsistentAvatar } from "@/components/avatar/AvatarBuilder";
import { AvatarModel, LeaderboardProps, PlayerModel } from "@/types";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { logWarn } from "@/lib/logger";

export default function Leaderboard({
  players,
  prevPlayers,
  myName,
}: LeaderboardProps) {
  const [localAvatar, setLocalAvatar] = useState<AvatarModel | null>(null);
  const [displayPlayers, setDisplayPlayers] = useState<PlayerModel[]>(
    prevPlayers && prevPlayers.length > 0 ? prevPlayers : players,
  );

  useEffect(() => {
    const stored = localStorage.getItem("guestAvatar");
    if (stored) {
      try {
        setLocalAvatar(JSON.parse(stored));
      } catch (e) {
        logWarn("Failed to load avatar from localStorage", { error: e });
      }
    }
  }, []);

  useEffect(() => {
    if (prevPlayers && prevPlayers.length > 0) {
      const timer = setTimeout(() => {
        setDisplayPlayers(players);
      }, 1500); // 1.5 seconds delay before animating
      return () => clearTimeout(timer);
    } else {
      setDisplayPlayers(players);
    }
  }, [players, prevPlayers]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-purple-800 via-indigo-700 to-blue-900 px-6 text-white">
      <h1 className="mb-10 text-4xl font-bold">Leaderboard</h1>

      <motion.div layout className="w-full max-w-3xl space-y-3">
        {displayPlayers.map((player, index) => {
          const isMe = player.nickname === myName;
          const avatarCfg: AvatarModel =
            player.avatar ??
            (isMe ? localAvatar : null) ??
            getConsistentAvatar(player.nickname);
          const rankEmoji =
            index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
          return (
            <motion.div
              layout
              layoutId={`player-${player.nickname}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
              key={player.nickname}
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
                  <Avatar config={avatarCfg} size={44} />
                </div>
                <div className="text-base font-semibold">{player.nickname}</div>
              </div>
              <div className="text-base font-bold">
                <AnimatedCounter value={player.score} /> pts
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Fun Animated Score Counter ──────────────────────────────────────────────
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1200; // slightly longer for more dramatic countup
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(start + (end - start) * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
        prevValueRef.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}</span>;
}
