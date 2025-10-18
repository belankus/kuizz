"use client";

import { useState } from "react";
import QRCodePlaceholder from "@/components/public/QRCodePlaceholder";
import Avatar from "../ui/avatar/Avatar";

interface LobbyContentInterface {
  joinCode: string;
}

export default function LobbyContent({ joinCode }: LobbyContentInterface) {
  const [players, setPlayers] = useState<string[]>(["Andin", "Budi"]);

  return (
    <>
      {/* Full-bleed hero-style lobby similar to Kahoot */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900"></div>

      <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-start px-6 pt-12 text-white">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">
              Join at <span className="font-semibold">kuizz.live</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 hover:bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11V7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11h10v9H7z"
                  />
                </svg>
                Lock
              </button>

              <button className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-800 shadow">
                Start
              </button>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between rounded-lg bg-white/5 p-6">
            <div>
              <div className="text-sm tracking-wide uppercase opacity-90">
                Game PIN
              </div>
              <div className="mt-2 text-6xl font-extrabold tracking-widest">
                {joinCode}
              </div>
              <div className="mt-1 text-sm opacity-90">
                Ask players to go to{" "}
                <span className="font-semibold">kuizz.live</span> and enter the
                PIN
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="inline-block rounded-md bg-white p-3">
                  <QRCodePlaceholder joinCode={joinCode} />
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm opacity-90">Players</div>
                <div className="mt-1 text-3xl font-bold">{players.length}</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center">
            <div className="rounded-full bg-white/10 px-6 py-3 text-lg text-white">
              Waiting for participants
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-10 sm:flex-row">
              {players.map((player, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center"
                >
                  <Avatar
                    src="/images/user/user-01.jpg"
                    status="online"
                    className="animation-pulsing"
                  />
                  <h3 className="mt-2 text-lg font-semibold">{player}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* bottom-right controls similar to Kahoot */}
      <div className="absolute right-6 bottom-6 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14"
            />
          </svg>
          <span>{players.length}</span>
        </div>

        <button className="rounded-lg bg-white/10 px-3 py-2 text-white">
          ⚙
        </button>
      </div>
    </>
  );
}
