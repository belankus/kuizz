"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function TestSocketPage() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io("http://localhost:3000");

    s.on("connect", () => {
      console.log("Connected:", s.id);
    });

    s.on("game_created", (data) => {
      console.log("Game created:", data);
    });

    s.on("player_joined", (data) => {
      console.log("Players:", data.players);
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

  const joinRoom = () => {
    socket?.emit("join_room", {
      roomCode: "123456",
      nickname: "Budi",
    });
  };

  const startGame = () => {
    socket?.emit("host_start_game", {
      roomCode: "123456",
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Socket Test</h1>

      <button onClick={createGame}>Create Game</button>
      <button onClick={joinRoom}>Join Room</button>
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}
