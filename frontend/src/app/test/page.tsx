"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function TestSocketPage() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io("http://localhost:3000");

    s.on("connect", () => {
      console.log("Connected:", s.id);
    });

    s.on("host_registered", (data) => {
      console.log("Host token:", data.hostToken);
      localStorage.setItem("hostToken", data.hostToken);
      localStorage.setItem("hostRoom", data.roomCode);
    });

    s.on("game_created", (data) => {
      console.log("Game created:", data);
    });

    s.on("phase_changed", (data) => {
      console.log("Phase:", data.phase);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const createGame = () => {
    socket?.emit("create_game", {
      roomCode: "123456",
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
