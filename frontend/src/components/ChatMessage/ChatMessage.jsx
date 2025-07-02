import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ChatInput from "../ChatInput/ChatInput";

export default function ChatMessages({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?.id) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/message/${selectedChat.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const handleNewMessage = (newMsg) => {
    setMessages((prev) => [...prev, newMsg]);
  };

  // 💥 Add a check for selectedChat and users
  if (!selectedChat || !selectedChat.users) {
    return (
      <div className="flex justify-center items-center h-full text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  const otherUser = selectedChat.users.find((u) => u.id !== user?.id);
  const receiverId = otherUser?.id;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs px-4 py-2 rounded-lg shadow text-white ${
              msg.senderId === user.id
                ? "bg-blue-600 self-end"
                : "bg-gray-400 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        {receiverId ? (
          <ChatInput
            chatId={selectedChat.id}
            receiverId={receiverId}
            onSend={handleNewMessage}
          />
        ) : (
          <p className="text-sm text-red-500">Receiver not found.</p>
        )}
      </div>
    </div>
  );
}
