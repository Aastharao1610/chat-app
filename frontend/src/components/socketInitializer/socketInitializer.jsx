// "use client";
// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { initSocket } from "@/lib/socket";
// import { addMessage, updateChat } from "@/store/chatSlice";
// import { createPeerConnection } from "@/webrtc/audio";

// const SocketInitializer = () => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);

//   useEffect(() => {
//     if (!user?.id) return;

//     const socket = initSocket(user.id);
//     window.socket = socket;

//     console.log("🔌 Connected to socket:", user.id);
//     // socket.emit("register-user", user.id);
//     socket.emit("join-user", user.id);

//     socket.on("receive-message", (message) => {
//       dispatch(addMessage(message)); // ✅ update message in Redux
//       dispatch(updateChat({ id: message.chatId, lastMessage: message })); // ✅ update chat preview
//     });
//     socket.on("incoming-call", async ({ offer, callerId }) => {
//       console.log("Incoming offer:", offer);
//       console.log("📞 Incoming call from", callerId);

//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       const peer = createPeerConnection();

//       stream.getTracks().forEach((track) => {
//         peer.addTrack(track, stream);
//       });

//       await peer.setRemoteDescription(new RTCSessionDescription(offer));

//       const answer = await peer.createAnswer();
//       await peer.setLocalDescription(answer);

//       // socket.emit("answer", {
//       //   to: from,
//       //   answer: answer,
//       // });
//       socket.emit("answer-call", {
//         callerId,
//         answer,
//       });

//       console.log("Answer sent");
//     });

//     return () => {
//       socket.off("receive-message");
//       // socket.disconnect();
//       window.socket = null;
//     };
//   }, [user?.id, dispatch]);

//   return null;
// };

// export default SocketInitializer;

"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initSocket } from "@/lib/socket";
import {
  addMessage,
  updateChat,
  setOnlineUsers,
  markAsRead,
} from "@/store/chatSlice";
import { createPeerConnection } from "@/webrtc/audio";

const SocketInitializer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.id) return;

    const socket = initSocket(user.id);
    window.socket = socket;

    console.log("🔌 Connected to socket:", user.id);

    // 1. Listen for Online Users (Fixes "Online status not visible")
    socket.on("get-online-users", (userIds) => {
      dispatch(setOnlineUsers(userIds));
    });

    // 2. Real-time Message Receipt (Fixes "Refresh to see message")
    socket.on("receive-message", (message) => {
      dispatch(addMessage(message));
      dispatch(updateChat({ id: message.chatId, lastMessage: message }));
    });

    // 3. Listen for Read Status (Fixes "Refresh to see read tick")
    socket.on("messages-read", ({ chatId, readerId }) => {
      dispatch(markAsRead({ chatId, readerId }));
    });

    // --- WebRTC Logic (Keep as you had it) ---
    socket.on("incoming-call", async ({ offer, callerId }) => {
      console.log("Incoming offer:", offer);
      console.log("📞 Incoming call from", callerId);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const peer = createPeerConnection();

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      // socket.emit("answer", {
      //   to: from,
      //   answer: answer,
      // });
      socket.emit("answer-call", {
        callerId,
        answer,
      });

      console.log("Answer sent");
    });

    return () => {
      socket.off("get-online-users");
      socket.off("receive-message");
      socket.off("messages-read");
      socket.off("incoming-call");
      window.socket = null;
    };
  }, [user?.id, dispatch]);

  return null;
};

export default SocketInitializer;
