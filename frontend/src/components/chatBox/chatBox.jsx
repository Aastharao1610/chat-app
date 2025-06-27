"use client";
import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import ChatMessages from "@/components/ChatMessage/ChatMessage";
import ChatInput from "@/components/ChatInput/ChatInput";

const ChatBox = ({ currentUser, selectedUser, currentChatId }) => {
  const [messages, setMessages] = useState([]);
  const socket = initSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await axios.get(
        `http://localhost:5000/api/messages?chatId=${currentChatId}`
      );
      setMessages(data.messages);
    };

    fetchMessages();
  }, [currentChatId]);

  useEffect(() => {
    socket.on("receive-message", (msg) => {
      console.log("New real-time message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    // Optional: clean up when component unmounts
    return () => socket.off("receive-message");
  }, []);

  const handleSend = (msg) => {
    setMessages((prev) => [...prev, msg]); // show own message instantly (optimistic)
  };

  return (
    <div className="flex flex-col h-full">
      <ChatMessages messages={messages} currentUser={currentUser} />
      <ChatInput
        currentUser={currentUser}
        selectedUser={selectedUser}
        currentChatId={currentChatId}
        onSend={handleSend}
      />
    </div>
  );
};

export default ChatBox;
