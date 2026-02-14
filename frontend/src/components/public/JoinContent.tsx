"use client";

import { useEffect, useState } from "react";

interface JoinContentInterface {
  sessionId: string;
}

export default function JoinContent({ sessionId }: JoinContentInterface) {
  const [players, setPlayers] = useState<string[]>(["Ayu", "Budi"]);
  const [nick, setNick] = useState("");
  const [code, setCode] = useState("KZ42");

  useEffect(() => {
    if (sessionId.length > 1) setCode(sessionId);
  }, []);

  return (
    <>
      {/* Full-bleed hero-style lobby similar to Kahoot */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900"></div>
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
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="Nama kamu"
              />
            </div>
            <div>
              <label className="text-sm">Join Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 w-full rounded-lg border p-3"
              />
            </div>

            <button
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
