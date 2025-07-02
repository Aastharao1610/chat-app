"use client";
import { useState } from "react";
import axios from "axios";

export default function ChatInput({ chatId, receiverId, onSend }) {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/message",
        { text, receiverId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onSend(res.data.message);
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded px-4 py-2"
        placeholder="Type your message..."
      />
      <button
        onClick={sendMessage}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
}
