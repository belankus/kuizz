import { io } from "socket.io-client";

export const socket = io("http://cachyos:3000", {
  autoConnect: false,
});
