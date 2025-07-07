// "use client";
// import { useState, useRef } from "react";
// import axios from "axios";
// import { getSocket } from "@/lib/socket"; // import socket client
// import { useSelector } from "react-redux";

// export default function ChatInput({ chatId, receiverId, onSend }) {
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

//       onSend(res.data.message);
//       setText("");

//       // Emit stop-typing immediately after sending
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
import { useState, useRef } from "react";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import { useSelector } from "react-redux";

export default function ChatInput({
  chatId,
  receiverId,
  onSend,
  receiverUser,
}) {
  const [text, setText] = useState("");
  const socket = getSocket();
  const typingTimeout = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/message",
        { text, receiverId },
        {
          withCredentials: true,
        }
      );

      const sentMsg = res.data.message;
      onSend(sentMsg);
      setText("");

      // ✅ Print to console: who is sending to whom

      console.log(
        `${user?.name} is sending message: "${sentMsg.text}" to ${
          receiverUser?.name || `User ID ${receiverId}`
        }`
      );

      socket?.emit("stop-typing", { to: receiverId });
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const handleTyping = () => {
    const socket = window.socket;
    if (socket && user?.id && receiverId) {
      socket.emit("typing", {
        senderId: user.id,
        receiverId,
      });
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
        className="flex-1 border rounded px-4 py-2"
        placeholder="Type your message..."
      />
      <button
        onClick={sendMessage}
        className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
}
