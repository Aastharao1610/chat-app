"use client";

import ChatMessages from "../ChatMessage/ChatMessage";
import SecondSidebar from "./secondSideBar";
import { cn } from "@/lib/utils";
import { setSelectedChat } from "@/store/chatSlice";
import { useDispatch, useSelector } from "react-redux";
export default function ChatBox() {
  const dispatch = useDispatch();
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  return (
    <div className="flex h-full overflow-hidden">
      <div
        className={cn(
          "w-full md:w-[300px] border-r border-gray-300 h-full",
          selectedChat ? "hidden md:block" : "block",
        )}
      >
        <SecondSidebar
          onSelectChat={(chat) => dispatch(setSelectedChat(chat))}
          selectedChat={selectedChat}
        />
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col h-full bg-white",
          selectedChat ? "block" : "hidden md:flex",
        )}
      >
        {selectedChat ? (
          <ChatMessages
            selectedChat={selectedChat}
            onBack={() => {
              dispatch(setSelectedChat(null));
              console.log("Back is clicked");
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
