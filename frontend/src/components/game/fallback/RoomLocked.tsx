"use client";

import { useRouter } from "next/navigation";

export default function RoomLocked() {
  const router = useRouter();

  const handleBack = () => {
    localStorage.removeItem("playerToken");
    localStorage.removeItem("nickname");
    localStorage.removeItem("roomCode");
    router.push("/join");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-800 px-6 text-white">
      <h1 className="text-4xl font-bold">Room Locked</h1>
      <p className="mt-4 text-center">The host has locked the room.</p>

      <button
        onClick={handleBack}
        className="mt-8 rounded-lg bg-white px-6 py-3 font-semibold text-gray-800 shadow hover:bg-white/80"
      >
        ← Back to Join
      </button>
    </div>
  );
}
