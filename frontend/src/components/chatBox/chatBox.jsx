"use client";
import { useState } from "react";
import ChatList from "./ChatList";
import ChatMessages from "../ChatMessage/ChatMessage";

export default function ChatBox() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Chat List */}
      <div className="w-[300px]  border-r border-gray-300">
        <ChatList onSelectChat={setSelectedChat} />
      </div>

      {/* Right Panel - Messages */}
      <div className="w-1/3 flex flex-col">
        {selectedChat ? (
          <ChatMessages selectedChat={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
