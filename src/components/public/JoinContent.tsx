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
      <div className="relative z-10 flex flex-col items-center justify-start min-h-[80vh] pt-12 text-gray-600 px-6">
        <div className="max-w-md mx-auto container-card">
          <a href="/" className="text-sm text-gray-500 mb-4 inline-block">
            ← Back
          </a>
          <h2 className="text-2xl font-semibold">Join Game</h2>
          <p className="text-sm text-gray-600 mt-2">
            Masukkan nama dan kode join yang diberikan host.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Nickname</label>
              <input
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                className="w-full mt-2 p-3 border rounded-lg"
                placeholder="Nama kamu"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Join Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full mt-2 p-3 border rounded-lg"
              />
            </div>

            <button
              disabled={!nick || !code}
              className="w-full mt-2 px-4 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
            >
              Join
            </button>

            <div className="text-xs text-gray-500 mt-3">
              Tip: jika kamu lihat QR, scan untuk membuka kuizz.live langsung.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
