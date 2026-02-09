// "use client";
// import { useState, useRef } from "react";
// import axios from "axios";
// import { getSocket } from "@/lib/socket";
// import { useSelector } from "react-redux";

// export default function ChatInput({
//   chatId,
//   receiverId,
//   onSend,
//   receiverUser,
// }) {
//   const [text, setText] = useState("");
//   const socket = getSocket();
//   const typingTimeout = useRef(null);
//   const { user } = useSelector((state) => state.auth);

//   const sendMessage = async () => {
//     if (!text.trim()) return;

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/message",
//         { text, receiverId },
//         {
//           withCredentials: true,
//         }
//       );

//       const sentMsg = res.data.message;
//       onSend(sentMsg);
//       setText("");

//       // ✅ Print to console: who is sending to whom

//       console.log(
//         `${user?.name} is sending message: "${sentMsg.text}" to ${
//           receiverUser?.name || `User ID ${receiverId}`
//         }`
//       );

//       socket?.emit("stop-typing", { to: receiverId });
//     } catch (err) {
//       console.error("Send failed:", err);
//     }
//   };

//   const handleTyping = () => {
//     const socket = window.socket;
//     if (socket && user?.id && receiverId) {
//       socket.emit("typing", {
//         senderId: user.id,
//         receiverId,
//       });
//     }
//   };

//   return (
//     <div className="flex gap-2">
//       <input
//         value={text}
//         onChange={(e) => {
//           setText(e.target.value);
//           handleTyping();
//         }}
//         className="flex-1 border rounded px-4 py-2"
//         placeholder="Type your message..."
//       />
//       <button
//         onClick={sendMessage}
//         className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         Send
//       </button>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import axios from "axios";

export default function ChatInput({ chatId, receiverId, receiverUser }) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/message`,
        {
          text,
          receiverId,
        },
        { withCredentials: true },
      );

      setText(""); // Clear input after send
      // ❌ No need to update Redux here — `SocketInitializer` handles real-time update
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 border border-gray-300 rounded-full px-4 py-2"
        placeholder={`Message ${receiverUser?.name || "user"}...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 py-2 rounded-full"
      >
        Send
      </button>
    </div>
  );
}
