"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { apiFetch, getAccessToken } from "@/lib/auth";
import { getRandomAvatar } from "@/components/avatar/AvatarBuilder";
import { Fredoka, Nunito } from "next/font/google";
import Link from "next/link";
import { AvatarModel } from "@/types";
import Avatar from "../avatar/Avatar";
import {
  ArrowRight,
  CircleUser,
  Keyboard,
  Pencil,
  SquareArrowOutUpRight,
  SquareMousePointer,
} from "lucide-react";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2>(1);
  const [nick, setNick] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<AvatarModel | null>(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Pre-fetch avatar for step 2 preview
    const fetchAvatar = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const meRes = await apiFetch("/users/me");
          if (meRes.ok) {
            const me = await meRes.json();
            setAvatar(me.avatar ?? getRandomAvatar());
            return;
          }
        }
      } catch {}
      setAvatar(getRandomAvatar());
    };
    fetchAvatar();
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
    const onRoomValid = () => {
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

  const handleJoin = async () => {
    if (!nick || !code) return;

    setLoading(true);
    setError(null);

    const avatarToSend = avatar || getRandomAvatar();
    const existingToken = localStorage.getItem("playerToken");

    const onPlayerRegistered = (data: { playerToken: string }) => {
      cleanupStep2Listeners();
      localStorage.setItem("nickname", nick);
      localStorage.setItem("roomCode", code);
      localStorage.setItem("playerToken", data.playerToken);
      if (avatarToSend) {
        localStorage.setItem("guestAvatar", JSON.stringify(avatarToSend));
      }

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
      avatar: avatarToSend,
      authToken: getAccessToken() ?? undefined,
    });
  };

  // Convert standard avatar ID syntax to URL if needed (e.g. dicebear)
  const renderAvatarPreview = () => {
    return (
      <div className="absolute -top-10 left-1/2 z-20 flex h-20 w-20 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-[#1a1025] bg-white shadow-xl">
        <Avatar config={avatar} size={80} />
      </div>
    );
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
            --bg-dark: #1a1025;
            --box-dark: #221730;
            --primary-accent: #aa33ff;
            --primary-hover: #9026df;
            --text-light: #ffffff;
            --text-dim: #9b8da9;
            --input-bg: #130a1c;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            font-family: ${nunito.style.fontFamily}, sans-serif;
            margin: 0;
            overflow-x: hidden;
        }

        .header-font {
            font-family: ${fredoka.style.fontFamily}, sans-serif;
        }

        /* Ambient glowing shapes */
        .ambient-shape {
            position: absolute;
            background: rgba(170, 51, 255, 0.05); /* very subtle purple */
            z-index: 0;
            pointer-events: none;
        }

        .shape-circle {
            border-radius: 50%;
            border: 2px solid rgba(170, 51, 255, 0.1);
        }

        .shape-triangle {
            width: 0;
            height: 0;
            border-left: 50px solid transparent;
            border-right: 50px solid transparent;
            border-bottom: 86px solid rgba(170, 51, 255, 0.08); /* triangle */
            background: transparent;
        }
        
        .shape-pentagon {
            background: rgba(170, 51, 255, 0.08);
            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }

        .shape-star {
            background: rgba(170, 51, 255, 0.08);
            clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }

        .glass-panel {
            background-color: var(--box-dark);
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 10;
        }
        
        /* Specific background for step 2 */
        .glass-panel-step2 {
            background-image: 
              radial-gradient(circle at top right, rgba(170, 51, 255, 0.3), transparent 50%),
              radial-gradient(circle at bottom left, rgba(46, 12, 85, 0.5), transparent 50%);
            background-color: var(--box-dark);
        }

        .input-dark {
            background-color: var(--input-bg);
            border: 2px solid transparent;
            color: white;
            transition: all 0.2s;
        }

        .input-dark:focus {
            border-color: var(--primary-accent);
            outline: none;
        }

        .input-dark::placeholder {
            color: var(--text-dim);
            font-weight: 600;
        }

        .btn-primary {
            background-color: var(--primary-accent);
            color: white;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(170, 51, 255, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(170, 51, 255, 0.4);
        }
        
        .btn-primary:active:not(:disabled) {
            transform: translateY(1px);
            box-shadow: 0 2px 10px rgba(170, 51, 255, 0.3);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            box-shadow: none;
        }
        
        /* Top lightning icon floating animation */
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        
        .floating-icon {
            animation: float 4s ease-in-out infinite;
        }
        `,
        }}
      />

      {/* Decorative Background Shapes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="ambient-shape shape-circle top-[10%] left-[10%] h-40 w-40"></div>
        <div className="ambient-shape shape-triangle top-[30%] right-[20%] rotate-12"></div>
        <div className="ambient-shape shape-circle bottom-[20%] left-[25%] h-20 w-20 opacity-50"></div>
        <div className="ambient-shape shape-circle right-[15%] bottom-[15%] h-32 w-32 border-4 opacity-30"></div>

        {step === 2 && (
          <>
            <div className="ambient-shape shape-pentagon top-[20%] left-[15%] h-32 w-32 -rotate-12 opacity-80"></div>
            <div className="ambient-shape shape-star right-[10%] bottom-[30%] h-24 w-24 rotate-45 opacity-60"></div>
          </>
        )}
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col bg-(--bg-dark)">
        {/* Navbar */}
        <nav className="flex w-full items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 -rotate-12 transform items-center justify-center rounded-lg bg-(--primary-accent) shadow-(--primary-accent)/30 shadow-lg">
              <SquareMousePointer className="text-[20px] text-white" />
            </div>
            <span className="header-font text-2xl font-bold tracking-wide text-white">
              Kuizz
            </span>
          </div>

          <div className="flex items-center gap-4">
            {step === 1 ? (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-white/5 bg-[#2a1b3d] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#34224c]"
              >
                <CircleUser className="text-[20px]" />
                Log in as Host
              </Link>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-white/5 bg-[#2a1b3d] px-4 py-2 text-sm font-bold tracking-widest text-white uppercase shadow-inner">
                <span className="text-xs text-(--text-dim)">PIN:</span>
                <span className="text-(--primary-accent)">{code}</span>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center p-4">
          {step === 1 && (
            <div className="floating-icon mb-8 flex h-20 w-20 rotate-3 items-center justify-center rounded-2xl bg-(--primary-accent) shadow-(--primary-accent)/30 shadow-lg">
              <SquareMousePointer className="text-white" size={60} />
            </div>
          )}

          <div className={`w-full max-w-md ${step === 2 ? "pt-8" : ""}`}>
            <div
              className={`glass-panel w-full p-8 md:p-10 ${step === 2 ? "glass-panel-step2" : ""}`}
            >
              {/* Avatar overlap for Step 2 */}
              {step === 2 && renderAvatarPreview()}

              <div className={`mb-8 text-center ${step === 2 ? "mt-4" : ""}`}>
                <h1
                  className={`header-font mb-2 text-3xl font-bold text-white`}
                >
                  {step === 1 ? "Enter Game PIN" : "Join the fun!"}
                </h1>
                <p className="text-sm font-medium text-[var(--text-dim)]">
                  {step === 1 ? (
                    "Join the fun! Enter the PIN provided by your host."
                  ) : (
                    <span>
                      You&apos;re connecting to Game PIN:{" "}
                      <span className="font-bold text-[var(--primary-accent)]">
                        {code}
                      </span>
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {step === 1 && (
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && code)
                          handleCheckRoom();
                      }}
                      placeholder="Game PIN"
                      className="input-dark header-font w-full rounded-xl px-6 py-4 text-center text-xl font-bold tracking-widest uppercase"
                      autoFocus
                    />
                    <Keyboard className="absolute top-1/2 right-4 -translate-y-1/2 text-[var(--text-dim)] opacity-50" />
                  </div>
                )}

                {step === 2 && (
                  <div className="relative">
                    <input
                      type="text"
                      value={nick}
                      onChange={(e) => setNick(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && nick) handleJoin();
                      }}
                      placeholder="Enter Nickname..."
                      className="input-dark header-font w-full rounded-xl py-4 pr-6 pl-12 text-lg font-bold"
                      autoFocus
                    />
                    <Pencil className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-dim)] opacity-50" />
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-400">
                    {error}
                  </div>
                )}

                {step === 1 ? (
                  <button
                    onClick={handleCheckRoom}
                    disabled={!code || loading}
                    className="btn-primary header-font flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xl font-bold"
                  >
                    {loading ? "Checking..." : "Join Game"}
                    {!loading && (
                      <ArrowRight className="text-white" size={24} />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={!nick || loading}
                    className="btn-primary header-font flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xl font-bold"
                  >
                    {loading ? "Joining..." : "OK, Go!"}
                    {!loading && (
                      <ArrowRight className="text-white" size={24} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {step === 1 && (
              <div className="mt-8 rounded-3xl border border-white/5 bg-[#130a1c] p-6 text-center opacity-80 transition-opacity hover:opacity-100">
                <p className="mb-2 text-sm font-bold text-[var(--text-light)]">
                  Don&apos;t have a PIN?
                </p>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-1 text-sm font-bold text-[var(--primary-accent)] transition-colors hover:text-[var(--primary-hover)]"
                >
                  Browse public quizzes
                  <SquareArrowOutUpRight size={18} />
                </Link>
              </div>
            )}

            {step === 2 && (
              <p className="mt-8 text-center text-xs text-[var(--text-dim)] opacity-60">
                By joining, you agree to our{" "}
                <Link
                  href="#"
                  className="underline transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
                .
              </p>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 text-center">
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-[var(--text-dim)] opacity-50">
            {step === 1 ? (
              <>
                <Link href="#" className="transition-colors hover:text-white">
                  Terms
                </Link>
                <span>•</span>
                <Link href="#" className="transition-colors hover:text-white">
                  Privacy
                </Link>
              </>
            ) : (
              <span className="tracking-[3px] uppercase">
                Kuizz Platform © {new Date().getFullYear()}
              </span>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}
