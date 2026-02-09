"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initSocket } from "@/lib/socket";
import { addMessage, updateChat } from "@/store/chatSlice";

const SocketInitializer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.id) return;

    const socket = initSocket(user.id);
    window.socket = socket;

    console.log("🔌 Connected to socket:", user.id);
    // socket.emit("register-user", user.id);
    socket.emit("join-user", user.id);

    socket.on("receive-message", (message) => {
      dispatch(addMessage(message)); // ✅ update message in Redux
      dispatch(updateChat({ id: message.chatId, lastMessage: message })); // ✅ update chat preview
    });

    return () => {
  socket.off("receive-message");
  socket.disconnect();
  window.socket = null;
};

  }, [user?.id, dispatch]);

  return null;
};

export default SocketInitializer;
