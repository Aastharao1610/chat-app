"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useSelector } from "react-redux";
import { UserRoundPlus } from "lucide-react";
import ChatRequestModal from "../ChatrequestModal/chatRequestModal";
import { useCallback } from "react";
import { setChats } from "@/store/chatSlice";

export default function ChatList({ onSelectChat, selectedChat }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const chats = useSelector((state) => state.chat.chats);
  const allMessages = useSelector((state) => state.chat.messages);

  //  Real time chat update
  const getUnreadCount = (chatId) => {
    return allMessages.filter(
      (msg) => msg.chatId === chatId && msg.receiverId === user.id && !msg.read,
    ).length;
  };

  const getOtherUser = (chat) => {
    if (!chat?.users || !Array.isArray(chat.users)) return null;
    if (!user?.id) return null;
    return chat.users.find((u) => u?.id && u.id !== user.id);
  };

  // fetching the chats

  const fetchChats = useCallback(async () => {
    console.log("Fetching Chats");
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/chat/my`,
        {
          withCredentials: true,
        },
      );
      console.log(res, "res");
      const allChats = res.data.chats || [];
      const counts = {};
      const uniqueChats = [];

      for (const chat of allChats) {
        const other = getOtherUser(chat);
        if (!other) continue;

        const exists = uniqueChats.find(
          (c) => getOtherUser(c)?.id === other.id,
        );
        if (!exists) {
          uniqueChats.push(chat);

          const unread = chat.messages?.filter(
            (msg) => msg.receiverId === user.id && !msg.read,
          ).length;

          if (unread > 0) counts[chat.id] = unread;
        }
      }
      console.log("📬 ChatList updated:", new Date().toLocaleTimeString());
      console.log("🔥 Full fetched chat list:", allChats);
      dispatch(setChats(uniqueChats));
      // setUnreadCounts(counts);

      console.log("👀 Updated uniqueChats:", uniqueChats);
      console.log("📊 Updated unread counts:", counts);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }, [user?.id]);

  // Initial Load
  useEffect(() => {
    if (user?.id) {
      fetchChats();
    }
  }, [user?.id]);

  useEffect(() => {
    const socket = window.socket;
    if (!socket || !user?.id) return;

    const handleRefresh = () => fetchChats();

    socket.on("receive-message", handleRefresh);

    socket.on("messages-read", handleRefresh);

    return () => {
      socket.off("receive-message", handleRefresh);
      socket.off("message-read", handleRefresh);
    };
  }, [user?.id, fetchChats]);
  return (
    <div className="p-4 w-full">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold  text-blue-600">Messages</h2>
        <button onClick={() => setIsModalOpen(true)}>
          <UserRoundPlus
            size={22}
            className="text-blue-600 hover:scale-110 transition"
          />
        </button>
      </div>

      {!user?.id ? (
        <p className="text-gray-400 text-sm">Loading user data...</p>
      ) : chats.length === 0 ? (
        <p className="text-gray-400 text-sm">You have no chats yet.</p>
      ) : (
        chats.map((chat) => {
          const otherUser = getOtherUser(chat);
          if (!otherUser) return null;

          const lastMessage = chat.messages?.[0];

          const unreadCount = getUnreadCount(chat.id);

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`flex items-center justify-between p-4 my-3 rounded-lg cursor-pointer transition-all border ${
                selectedChat?.id === chat.id
                  ? "bg-blue-100 border-blue-400"
                  : "hover:bg-blue-50 border-gray-200"
              }`}
            >
              <div className="flex my-3 items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {otherUser?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {otherUser?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-[180px]">
                    {lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadCount}
                </div>
              )}
            </div>
          );
        })
      )}

      <ChatRequestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
