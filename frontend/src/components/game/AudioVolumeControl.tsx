"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudioManager } from "@/lib/useAudioManager";

interface AudioVolumeControlProps {
  inline?: boolean;
}

export default function AudioVolumeControl({
  inline = false,
}: AudioVolumeControlProps) {
  const { isMuted, volume, setVolume, playClick } = useAudioManager();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={
        inline
          ? "relative z-[100] flex flex-col items-start gap-2 md:flex-row md:items-center"
          : "fixed left-6 bottom-6 z-[100] flex flex-col items-start gap-2 md:flex-row md:items-center"
      }
    >
      <button
        type="button"
        onClick={() => {
          playClick();
          setIsOpen((open) => !open);
        }}
        aria-label="Open music volume controls"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-xl bg-[#2a1b25] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a2835]"
      >
        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 flex w-48 max-w-[calc(100vw-2rem)] items-center justify-center gap-3 rounded-xl bg-[#2a1b25] px-4 py-2.5 text-white shadow-2xl backdrop-blur-md md:static md:bottom-auto md:mb-0">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Music volume"
            className="h-2 w-full cursor-pointer accent-purple-500"
          />
          <span className="shrink-0 text-xs font-semibold">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}