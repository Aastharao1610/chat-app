import { io } from "socket.io-client";

let socket;

export const initSocket = (userId) => {
  if (!socket && typeof userId !== "undefined" && userId !== null) {
    console.log("Connecting to socket server on port 4001 ✅");

    socket = io("http://localhost:4001", {
      withCredentials: true,
      query: { userId },
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });
  }
  return socket;
};

export const getSocket = () => socket;
