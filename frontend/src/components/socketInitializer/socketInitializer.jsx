// "use client";
// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { initSocket } from "@/lib/socket";
// import { addMessage } from "@/store/chatSlice";

// const SocketInitializer = () => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);

//   useEffect(() => {
//     if (!user?.id) return;

//     const socket = initSocket(user.id);
//     window.socket = socket;

//     console.log("🔌 Joined socket room:", user.id);

//     const handleIncomingMessage = (message) => {
//       dispatch(addMessage(message));
//     };

//     socket.on("receive-message", handleIncomingMessage);

//     return () => {
//       socket.off("receive-message", handleIncomingMessage);
//     };
//   }, [user?.id, dispatch]);

//   return null;
// };

// export default SocketInitializer;

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

    socket.on("receive-message", (message) => {
      dispatch(addMessage(message)); // ✅ update message in Redux
      dispatch(updateChat({ id: message.chatId, lastMessage: message })); // ✅ update chat preview
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, dispatch]);

  return null;
};

export default SocketInitializer;
