"use client";
import { useState } from "react";
import axios from "axios";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { addMessage } from "@/store/chatSlice";

export default function ChatInput({ receiverId, receiverUser, chatId }) {
  const [text, setText] = useState("");
  const dispatch = useDispatch();

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
        `/api/message`,
        {
          text,
          receiverId,
        },
        { withCredentials: true },
      );
      dispatch(addMessage(res.data.message));
      setText(""); // Clear input after send
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex items-center gap-1 md:gap-2  dark:bg-transparent p-1">
      <input
        className="flex-1 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 md:py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
        placeholder={`Message ${receiverUser?.name || "user"}...`}
        value={text}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className={cn(
          "bg-blue-600 text-white p-2.5 md:px-5 md:py-2 rounded-full transition-all flex items-center justify-center",
          text.trim()
            ? "opacity-100 active:scale-90"
            : "opacity-50 cursor-not-allowed",
        )}
      >
        <SendHorizontal size={20} className="md:mr-2" />
        <span className="hidden md:inline font-medium">Send</span>
      </button>
    </div>
  );
}
