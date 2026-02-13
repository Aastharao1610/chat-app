import { io } from "socket.io-client";

let socket;
console.log("SOCKET URL 👉", process.env.NEXT_PUBLIC_SOCKET_URL);

export const initSocket = (userId) => {
  if (!socket && typeof userId !== "undefined" && userId !== null) {
    console.log("Connecting to socket server on port 4001 ");

    socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
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
