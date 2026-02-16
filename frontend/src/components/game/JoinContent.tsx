"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";

export default function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nick, setNick] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    console.log("Socket connected?", socket.connected);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket error:", err);
    });
  }, []);

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (roomId) setCode(roomId);
  }, [searchParams]);

  const handleJoin = () => {
    if (!nick || !code) return;

    setLoading(true);
    setError(null);

    const existingToken = localStorage.getItem("playerToken");

    socket.emit("join_room", {
      roomCode: code,
      nickname: nick,
      playerToken: existingToken ?? undefined,
    });

    socket.once("player_registered", (data) => {
      localStorage.setItem("nickname", nick);
      localStorage.setItem("roomCode", code);
      localStorage.setItem("playerToken", data.playerToken);

      router.push(`/game/${code}`);
    });

    socket.once("room_not_found", () => {
      setError("Room tidak ditemukan.");
      setLoading(false);
    });

    socket.once("room_locked", () => {
      setError("Room sudah dikunci oleh host.");
      setLoading(false);
    });

    socket.once("game_already_started", () => {
      setError("Game sudah dimulai.");
      setLoading(false);
    });
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

            {error && (
              <div className="rounded bg-red-500 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={!nick || !code || loading}
              className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-3 text-white disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join"}
            </button>

            <div className="mt-3 text-xs opacity-80">
              Tip: jika kamu lihat QR, scan untuk membuka kuizz.live langsung.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
