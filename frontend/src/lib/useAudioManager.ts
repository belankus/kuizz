"use client";

import { useCallback, useEffect, useState } from "react";

type BackgroundTrack = "lobby" | "game" | "victory";

const SOUND_PATHS: Record<BackgroundTrack | "click", string> = {
  lobby: "/sounds/lobby.mp3",
  game: "/sounds/game.mp3",
  victory: "/sounds/victory.mp3",
  click: "/sounds/click.mp3",
};

const listeners = new Set<
  (state: { isMuted: boolean; volume: number }) => void
>();
let isMuted = false;
let volume = 0.8;
let backgroundAudio: HTMLAudioElement | null = null;
let backgroundBaseVolume = 0.3;
const effectAudio = new Set<HTMLAudioElement>();

const notifyMuteChange = () => {
  listeners.forEach((listener) => listener({ isMuted, volume }));
};

const handlePlaybackError = (error: unknown, source: string) => {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    console.debug(`Audio playback requires user interaction: ${source}`);
    return;
  }

  console.error(`Unable to play audio: ${source}`, error);
};

const playAudio = (audio: HTMLAudioElement, source: string) => {
  void audio.play().catch((error: unknown) => {
    handlePlaybackError(error, source);
  });
};

const stopBackground = () => {
  if (!backgroundAudio) return;

  backgroundAudio.pause();
  backgroundAudio.currentTime = 0;
  backgroundAudio = null;
};

const playBackground = (
  track: BackgroundTrack,
  baseVolume: number,
  loop: boolean,
) => {
  if (typeof window === "undefined") return;

  stopBackground();

  const audio = new Audio(SOUND_PATHS[track]);
  audio.loop = loop;
  backgroundBaseVolume = baseVolume;
  audio.volume = backgroundBaseVolume * volume;
  audio.muted = isMuted;
  backgroundAudio = audio;
  playAudio(audio, SOUND_PATHS[track]);
};

const playEffect = () => {
  if (typeof window === "undefined") return;

  const audio = new Audio(SOUND_PATHS.click);
  audio.volume = 0.4;
  audio.muted = isMuted;
  effectAudio.add(audio);
  audio.addEventListener("ended", () => {
    effectAudio.delete(audio);
  });
  playAudio(audio, SOUND_PATHS.click);
};

export function useAudioManager() {
  const [audioState, setAudioState] = useState({ isMuted, volume });

  useEffect(() => {
    const storedVolume = window.localStorage.getItem("audioVolume");
    if (storedVolume !== null) {
      const parsedVolume = Number(storedVolume);
      if (Number.isFinite(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 1) {
        volume = parsedVolume;
      }
    }

    const listener = (nextState: { isMuted: boolean; volume: number }) =>
      setAudioState(nextState);
    listeners.add(listener);
    setAudioState({ isMuted, volume });
    notifyMuteChange();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const playLobbyBgm = useCallback(() => {
    playBackground("lobby", 0.3, true);
  }, []);

  const playGameBgm = useCallback(() => {
    playBackground("game", 0.3, true);
  }, []);

  const playVictoryBgm = useCallback(() => {
    playBackground("victory", 0.5, false);
  }, []);

  const playClick = useCallback(() => {
    playEffect();
  }, []);

  const stopAll = useCallback(() => {
    stopBackground();
  }, []);

  const toggleMute = useCallback(() => {
    isMuted = !isMuted;

    if (backgroundAudio) backgroundAudio.muted = isMuted;
    effectAudio.forEach((audio) => {
      audio.muted = isMuted;
    });
    notifyMuteChange();
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    volume = Math.min(1, Math.max(0, nextVolume));

    if (backgroundAudio) {
      backgroundAudio.volume = backgroundBaseVolume * volume;
    }
    window.localStorage.setItem("audioVolume", String(volume));
    notifyMuteChange();
  }, []);

  return {
    isMuted: audioState.isMuted,
    volume: audioState.volume,
    playLobbyBgm,
    playGameBgm,
    playVictoryBgm,
    playClick,
    stopAll,
    toggleMute,
    setVolume,
  };
}
