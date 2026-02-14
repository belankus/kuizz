interface RevealProps {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  selectedOptionId: string | null;
}

export default function Reveal({
  question,
  options,
  correctOptionId,
  selectedOptionId,
}: RevealProps) {
  const isCorrect = selectedOptionId === correctOptionId;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 px-6 text-white">
      <h1 className="text-center text-3xl font-bold">{question}</h1>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((opt) => {
          const isCorrectOption = opt.id === correctOptionId;
          const isSelected = opt.id === selectedOptionId;

          return (
            <div
              key={opt.id}
              className={`rounded-xl px-6 py-6 text-lg font-semibold shadow ${
                isCorrectOption
                  ? "scale-105 bg-green-500"
                  : isSelected
                    ? "bg-red-500"
                    : "bg-gray-500/40"
              }`}
            >
              {opt.text}
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-2xl font-bold">
        {isCorrect ? "🎉 Correct!" : "❌ Wrong!"}
      </div>
    </div>
  );
}
