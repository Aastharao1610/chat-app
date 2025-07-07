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
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);

  // Show latest chat list and re-render when socket updates it

  const [unreadCounts, setUnreadCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const getOtherUser = (chat) => {
    if (!chat?.users || !Array.isArray(chat.users)) return null;
    if (!user?.id) return null;
    return chat.users.find((u) => u?.id && u.id !== user.id);
  };

  const fetchChats = useCallback(async () => {
    console.log("📡 Fetching Chats");
    try {
      const res = await axios.get("http://localhost:5000/api/chat/my", {
        withCredentials: true,
      });
      const allChats = res.data.chats || [];
      const counts = {};
      const uniqueChats = [];

      for (const chat of allChats) {
        const other = getOtherUser(chat);
        if (!other) continue;

        const exists = uniqueChats.find(
          (c) => getOtherUser(c)?.id === other.id
        );
        if (!exists) {
          uniqueChats.push(chat);

          const unread = chat.messages?.filter(
            (msg) => msg.receiverId === user.id && !msg.read
          ).length;

          if (unread > 0) counts[chat.id] = unread;
        }
      }
      console.log("📬 ChatList updated:", new Date().toLocaleTimeString());
      console.log("🔥 Full fetched chat list:", allChats);
      dispatch(setChats(uniqueChats));
      setUnreadCounts(counts);

      console.log("👀 Updated uniqueChats:", uniqueChats);
      console.log("📊 Updated unread counts:", counts);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchChats();
    }
  }, [user?.id]);
  const handleRefresh = useCallback(() => {
    console.log("📥 Socket event triggered → refreshing ChatList");
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    const socket = window.socket;

    if (!socket || !socket.connected || !user?.id) {
      console.warn("🚫 Socket not connected yet");
      return;
    }

    console.log("✅ Socket is connected, attaching listeners");

    const onReceiveMessage = (msg) => {
      console.log("🔥 receive-message received:", msg);
      handleRefresh();
    };

    socket.off("receive-message", onReceiveMessage); // always clean old
    socket.on("receive-message", onReceiveMessage);

    return () => {
      console.log("🧹 Cleaning up receive-message listener");
      socket.off("receive-message", onReceiveMessage);
    };
  }, [user?.id, handleRefresh]);

  useEffect(() => {
    if (selectedChat?.id && unreadCounts[selectedChat.id]) {
      setUnreadCounts((prev) => {
        const updated = { ...prev };
        delete updated[selectedChat.id];
        return updated;
      });
    }
  }, [selectedChat]);

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Messages</h2>
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

          const unreadCount = unreadCounts[chat.id] || 0;

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
