"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { getAccessToken } from "@/lib/auth";

export default function TestSocketPage() {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("host_registered", (data) => {
      console.log("Host token:", data.hostToken);
      localStorage.setItem("hostToken", data.hostToken);
      localStorage.setItem("hostRoom", data.roomCode);
    });

    socket.on("game_created", (data) => {
      console.log("Game created:", data);
    });

    socket.on("phase_changed", (data) => {
      console.log("Phase:", data.phase);
    });

    return () => {
      socket.off("connect");
      socket.off("host_registered");
      socket.off("game_created");
      socket.off("phase_changed");
    };
  }, []);

  const createGame = () => {
    socket?.emit("create_game", {
      roomCode: "123456",
      token: getAccessToken(),
    });
  };

  const startGame = () => {
    const hostToken = localStorage.getItem("hostToken");

    socket?.emit("host_start_game", {
      roomCode: "123456",
      hostToken,
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Socket Test (Host)</h1>

      <Button onClick={createGame}>Create Game</Button>
      <Button onClick={startGame}>Start Game</Button>
    </div>
  );
}
