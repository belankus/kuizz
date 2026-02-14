"use client";

import { useRouter } from "next/navigation";

export default function RoomNotFound() {
  const router = useRouter();

  const handleBack = () => {
    localStorage.removeItem("playerToken");
    localStorage.removeItem("nickname");
    localStorage.removeItem("roomCode");
    router.push("/join");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-600 px-6 text-white">
      <h1 className="text-4xl font-bold">Room Not Found</h1>
      <p className="mt-4 text-center">
        The game room does not exist or has expired.
      </p>

      <button
        onClick={handleBack}
        className="mt-8 rounded-lg bg-white px-6 py-3 font-semibold text-red-600 shadow hover:bg-white/80"
      >
        ← Back to Join
      </button>
    </div>
  );
}
