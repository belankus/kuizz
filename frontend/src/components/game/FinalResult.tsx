"use client";

interface Player {
  name: string;
  score: number;
}

interface FinalResultProps {
  players: Player[];
  myName: string;
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

  const myRank = sorted.findIndex((p) => p.name === myName) + 1;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-purple-800 via-indigo-700 to-blue-900 px-6 py-16 text-white">
      <h1 className="mb-12 text-4xl font-bold">🎉 Game Finished!</h1>

      {/* Podium */}
      <div className="flex items-end justify-center gap-8">
        {topThree[1] && <PodiumCard player={topThree[1]} position={2} />}
        {topThree[0] && <PodiumCard player={topThree[0]} position={1} />}
        {topThree[2] && <PodiumCard player={topThree[2]} position={3} />}
      </div>

      {/* My Result */}
      <div className="mt-12 text-xl">
        You finished <span className="font-bold">#{myRank}</span>
      </div>

      {/* Full Leaderboard */}
      <div className="mt-10 w-full max-w-3xl space-y-3">
        {sorted.map((player, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg px-6 py-3 ${
              player.name === myName
                ? "bg-yellow-500 text-black"
                : "bg-white/10"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-bold">{index + 1}</span>
              <span>{player.name}</span>
            </div>
            <span className="font-semibold">{player.score}</span>
          </div>
        ))}
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
  player: { name: string; score: number };
  position: number;
}) {
  const height = position === 1 ? "h-40" : position === 2 ? "h-32" : "h-28";

  const medal = position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉";

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-2xl">{medal}</div>
      <div
        className={`flex w-24 flex-col items-center justify-end rounded-t-lg bg-white/20 ${height}`}
      >
        <div className="pb-3 text-center">
          <div className="font-bold">{player.name}</div>
          <div className="text-sm opacity-80">{player.score}</div>
        </div>
      </div>
    </div>
  );
}
