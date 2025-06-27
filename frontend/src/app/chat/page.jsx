"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../../components/SideBar/SideBar";
import ChatHeader from "../../components/chat/ChatHeader";
import ChatMessages from "@/components/ChatMessage/ChatMessage";
import ChatInput from "@/components/ChatInput/ChatInput";
import ChatRequestModal from "@/components/ChatrequestModal/chatRequestModal";
import { Button } from "@/components/ui/button";

const ChatPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    id: 2,
    name: "Jane Doe",
  });
  const [chatId, setChatId] = useState(1); // Replace with actual selected chatId
  const { user: currentUser } = useSelector((state) => state.auth);

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-background">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold">Chats</h2>
          <Button onClick={() => setShowModal(true)}>New Chat</Button>
        </div>

        <ChatHeader />
        <ChatMessages />
        <ChatInput
          currentUser={currentUser}
          selectedUser={selectedUser}
          currentChatId={chatId}
        />
      </div>

      <ChatRequestModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ChatPage;
