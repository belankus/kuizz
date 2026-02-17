import { io } from "socket.io-client";

const ROOM_CODE = "945520";
const TOTAL_USERS = 100;

for (let i = 0; i < TOTAL_USERS; i++) {
  const socket = io("http://localhost:3000");

  let playerToken = null;

  socket.on("connect", () => {
    socket.emit("join_room", {
      roomCode: ROOM_CODE,
      nickname: `Bot_${i}`,
    });
  });

  socket.on("player_registered", (data) => {
    playerToken = data.playerToken;
  });

  socket.on("question_started", (data) => {
    setTimeout(() => {
      if (!playerToken) return;

      const randomOption =
        data.question.options[
          Math.floor(Math.random() * data.question.options.length)
        ];

      socket.emit("submit_answer", {
        roomCode: ROOM_CODE,
        selectedOptionId: randomOption.id,
      });
    }, Math.random() * 2000);
  });
}
