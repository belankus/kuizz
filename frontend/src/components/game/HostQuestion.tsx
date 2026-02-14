"use client";

// interface HostQuestionProps {
//   question: string;
//   options: { id: string; text: string }[];
//   timeLeft: number;
//   answerStats: Record<string, number>;
//   totalPlayers: number;
//   onEndQuestion: () => void;
// }

export default function HostQuestion() {
  const question = "What is the capital of France";
  const options = [
    { id: "1", text: "London" },
    { id: "2", text: "Berlin" },
    { id: "3", text: "Paris" },
    { id: "4", text: "Madrid" },
  ];
  const timeLeft = 30;
  const answerStats = {
    "1": 12,
    "2": 8,
    "3": 25,
    "4": 5,
  };
  const totalPlayers = 50;
  const onEndQuestion = () => {
    console.log("Ending question");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 px-8 py-8 text-white">
      {/* Top Bar */}
      <div className="mb-8 flex items-center justify-between">
        <div className="text-2xl font-bold">⏳ {timeLeft}s</div>
        <div>
          {Object.values(answerStats).reduce((a, b) => a + b, 0)} /{" "}
          {totalPlayers} answered
        </div>
      </div>

      {/* Question */}
      <h1 className="mb-12 text-center text-4xl font-bold">{question}</h1>

      {/* Distribution */}
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {options.map((opt, index) => {
          const count = answerStats[opt.id] || 0;
          const percentage = totalPlayers ? (count / totalPlayers) * 100 : 0;

          return (
            <div key={opt.id}>
              <div className="mb-2 flex justify-between">
                <span>{opt.text}</span>
                <span>{count}</span>
              </div>
              <div className="h-4 rounded bg-white/20">
                <div
                  className="h-4 rounded bg-green-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-12 flex justify-center gap-6">
        <button
          onClick={onEndQuestion}
          className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-800 shadow hover:bg-white/80"
        >
          End Question
        </button>
      </div>
    </div>
  );
}
