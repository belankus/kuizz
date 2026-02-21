"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";

export default function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2>(1);
  const [nick, setNick] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (roomId) setCode(roomId);
  }, [searchParams]);

  const handleCheckRoom = () => {
    if (!code) return;

    setLoading(true);
    setError(null);

    // One-time listeners for step 1
    const onRoomValid = (data: { roomCode: string }) => {
      cleanupStep1Listeners();
      setLoading(false);
      setStep(2); // Proceed to nickname phase
    };

    const onRoomError = (errorMessage: string) => {
      cleanupStep1Listeners();
      setError(errorMessage);
      setLoading(false);
    };

    const onRoomNotFound = () => onRoomError("Room tidak ditemukan.");
    const onRoomLocked = () => onRoomError("Room sudah dikunci oleh host.");
    const onGameStarted = () => onRoomError("Game sudah dimulai.");

    const cleanupStep1Listeners = () => {
      socket.off("room_valid", onRoomValid);
      socket.off("room_not_found", onRoomNotFound);
      socket.off("room_locked", onRoomLocked);
      socket.off("game_already_started", onGameStarted);
    };

    socket.on("room_valid", onRoomValid);
    socket.on("room_not_found", onRoomNotFound);
    socket.on("room_locked", onRoomLocked);
    socket.on("game_already_started", onGameStarted);

    socket.emit("check_room", { roomCode: code });
  };

  const handleJoin = () => {
    if (!nick || !code) return;

    setLoading(true);
    setError(null);

    const existingToken = localStorage.getItem("playerToken");

    const onPlayerRegistered = (data: { playerToken: string }) => {
      cleanupStep2Listeners();
      localStorage.setItem("nickname", nick);
      localStorage.setItem("roomCode", code);
      localStorage.setItem("playerToken", data.playerToken);

      router.push(`/game/${code}`);
    };

    const onNicknameTaken = () => {
      cleanupStep2Listeners();
      setError("Nickname sudah dipakai. Silakan coba yang lain.");
      setLoading(false);
    };

    // Failsafe error handling in case the game state changed between Step 1 and Step 2
    const onActionError = (errorMessage: string) => {
      cleanupStep2Listeners();
      setError(errorMessage);
      setLoading(false);
    };

    const onRoomNotFound = () => onActionError("Room tidak ditemukan.");
    const onRoomLocked = () => onActionError("Room sudah dikunci oleh host.");
    const onGameStarted = () => onActionError("Game sudah dimulai.");

    const cleanupStep2Listeners = () => {
      socket.off("player_registered", onPlayerRegistered);
      socket.off("nickname_taken", onNicknameTaken);
      socket.off("room_not_found", onRoomNotFound);
      socket.off("room_locked", onRoomLocked);
      socket.off("game_already_started", onGameStarted);
    };

    socket.on("player_registered", onPlayerRegistered);
    socket.on("nickname_taken", onNicknameTaken);
    socket.on("room_not_found", onRoomNotFound);
    socket.on("room_locked", onRoomLocked);
    socket.on("game_already_started", onGameStarted);

    socket.emit("join_room", {
      roomCode: code,
      nickname: nick,
      playerToken: existingToken ?? undefined,
    });
  };

  return (
    <>
      <div className="absolute inset-0 bg-linear-to-br from-blue-800 via-blue-700 to-blue-900"></div>

      <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-start px-6 pt-12 text-white">
        <div className="container-card mx-auto w-full max-w-md">
          {step === 1 ? (
            <a href="/" className="mb-4 inline-block text-sm">
              ← Back
            </a>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="mb-4 inline-block text-sm"
              disabled={loading}
            >
              ← Back to Code
            </button>
          )}

          <h2 className="text-2xl font-semibold">Join Game</h2>
          <p className="mt-2 text-sm">
            {step === 1
              ? "Masukkan kode join yang diberikan host."
              : "Masukkan nama panggilanmu di permainan ini."}
          </p>

          <div className="mt-4 space-y-3">
            {step === 1 && (
              <div>
                <label className="text-sm">Join Code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-2 w-full rounded-lg border p-3 text-center font-mono text-lg tracking-widest text-black uppercase"
                  placeholder="KODE RUANGAN"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && code)
                      handleCheckRoom();
                  }}
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="text-sm">Nickname</label>
                <input
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  className="mt-2 w-full rounded-lg border p-3 text-black"
                  placeholder="Nama kamu"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && nick) handleJoin();
                  }}
                />
              </div>
            )}

            {error && (
              <div className="rounded bg-red-500 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <button
                onClick={handleCheckRoom}
                disabled={!code || loading}
                className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-3 text-white disabled:opacity-50"
              >
                {loading ? "Checking..." : "Enter"}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={!nick || loading}
                className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-3 text-white disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join"}
              </button>
            )}

            <div className="mt-3 text-center text-xs opacity-80">
              Tip: jika kamu lihat QR, scan untuk membuka kuizz.live langsung.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
