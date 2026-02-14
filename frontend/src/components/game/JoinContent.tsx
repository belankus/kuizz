"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nick, setNick] = useState("");
  const [code, setCode] = useState("");

  // Auto-fill roomId from query ?roomId=123456
  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (roomId) setCode(roomId);
  }, [searchParams]);

  const handleJoin = () => {
    if (!nick || !code) return;

    // Save to localStorage
    localStorage.setItem("nickname", nick);
    localStorage.setItem("roomCode", code);

    // Redirect to game route
    router.push(`/game/${code}`);
  };

  return (
    <>
      <div className="absolute inset-0 bg-linear-to-br from-blue-800 via-blue-700 to-blue-900"></div>

      <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-start px-6 pt-12 text-white">
        <div className="container-card mx-auto max-w-md">
          <a href="/" className="mb-4 inline-block text-sm">
            ← Back
          </a>

          <h2 className="text-2xl font-semibold">Join Game</h2>
          <p className="mt-2 text-sm">
            Masukkan nama dan kode join yang diberikan host.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm">Nickname</label>
              <input
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                className="mt-2 w-full rounded-lg border p-3 text-black"
                placeholder="Nama kamu"
              />
            </div>

            <div>
              <label className="text-sm">Join Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 w-full rounded-lg border p-3 text-black"
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={!nick || !code}
              className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-3 text-white disabled:opacity-50"
            >
              Join
            </button>

            <div className="mt-3 text-xs">
              Tip: jika kamu lihat QR, scan untuk membuka kuizz.live langsung.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
