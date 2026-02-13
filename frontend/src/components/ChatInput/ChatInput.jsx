"use client";
import { useState } from "react";
import axios from "axios";

export default function ChatInput({ receiverId, receiverUser, chatId }) {
  const [text, setText] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (window.socket) {
      console.log(`Sending typing event to : ${receiverId}`);
      window.socket.emit("typing", {
        receiverId: receiverId,
        chatId: chatId,
      });
    }
  };
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
        onChange={handleInputChange}
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
