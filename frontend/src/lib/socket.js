import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    console.log("Connecting to socket server on port 4001 ✅");
    socket = io("http://localhost:4001", {
      withCredentials: true,
    });
  }
  return socket;
};

export const getSocket = () => socket;
