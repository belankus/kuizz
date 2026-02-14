interface Player {
  nickname: string;
  score: number;
}

interface LeaderboardProps {
  players: Player[];
  myName: string | null;
}

export default function Leaderboard({ players, myName }: LeaderboardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-purple-800 via-indigo-700 to-blue-900 px-6 text-white">
      <h1 className="mb-10 text-4xl font-bold">Leaderboard</h1>

      <div className="w-full max-w-3xl space-y-4">
        {players.map((player, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg px-6 py-4 shadow ${
              player.nickname === myName
                ? "bg-yellow-500 text-black"
                : "bg-white/10"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">{index + 1}</div>
              <div className="text-lg font-semibold">{player.nickname}</div>
            </div>
            <div className="text-lg font-bold">{player.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
