"use client";

import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";

export default function LiveSync() {
  const [ping, setPing] = useState(100); // Default starting ping

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const handlePong = (data: { start: number }) => {
      if (data && data.start) {
        const duration = Date.now() - data.start;
        setPing(duration);
      }
    };

    const setupPing = () => {
      // Clean up previous listeners to prevent memory leaks in strict mode
      socket.off("latency_pong", handlePong);
      socket.on("latency_pong", handlePong);

      // Emit ping every 2 seconds
      interval = setInterval(() => {
        if (socket.connected) {
          socket.emit("latency_ping", { start: Date.now() });
        }
      }, 2000);
    };

    if (socket.connected) {
      setupPing();
    } else {
      socket.connect();
      socket.once("connect", () => {
        setupPing();
      });
    }

    return () => {
      if (interval) clearInterval(interval);
      socket.off("latency_pong", handlePong);
      // Removed socket.off("connect") because it might kill global reconnection logic elsewhere
    };
  }, []);

  let bars = 3;
  if (ping > 120) bars = 1;
  else if (ping > 60) bars = 2; // the user specifically asked for >60ms to be 2 bars

  let pulseColor = "bg-green-400";
  let dotColor = "bg-green-500";
  let barColor = "bg-green-500";
  let borderColor = "border-green-200";
  let textColor = "text-green-600";

  if (bars === 1) {
    pulseColor = "bg-red-400";
    dotColor = "bg-red-500";
    barColor = "bg-red-500";
    borderColor = "border-red-200";
    textColor = "text-red-600";
  } else if (bars === 2) {
    pulseColor = "bg-yellow-400";
    dotColor = "bg-yellow-500";
    barColor = "bg-yellow-500";
    borderColor = "border-yellow-200";
    textColor = "text-yellow-600";
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-full border ${borderColor} bg-white px-4 py-1.5 shadow-sm transition-colors duration-300`}
    >
      <div className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pulseColor} opacity-75`}
        ></span>
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}
        ></span>
      </div>
      <div className="flex h-3 items-end gap-[2px]">
        <div
          className={`h-1.5 w-[3px] rounded-sm ${bars >= 1 ? barColor : "bg-gray-300"}`}
        />
        <div
          className={`h-2 w-[3px] rounded-sm ${bars >= 2 ? barColor : "bg-gray-300"}`}
        />
        <div
          className={`h-3 w-[3px] rounded-sm ${bars >= 3 ? barColor : "bg-gray-300"}`}
        />
      </div>
      <span className={`text-[10px] font-bold tracking-widest ${textColor}`}>
        LIVE SYNC{" "}
        <span className="ml-1 font-medium tracking-normal text-gray-400">
          {ping}ms
        </span>
      </span>
    </div>
  );
}
