"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { UserRoundPlus, MessageSquare } from "lucide-react"; // Added MessageSquare
import ChatRequestModal from "../../../../components/modal/ChatrequestModal/chatRequestModal";
import { setChats } from "@/store/chatSlice";
import { cn } from "@/lib/utils";

export default function ChatList({ onSelectChat, selectedChat }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const chats = useSelector((state) => state.chat.chats);
  const allMessages = useSelector((state) => state.chat.messages);

  // 1. Optimized Unread Calculation (Memoized)
  const unreadMap = useMemo(() => {
    const counts = {};
    allMessages.forEach((msg) => {
      if (msg.receiverId === user?.id && !msg.read) {
        counts[msg.chatId] = (counts[msg.chatId] || 0) + 1;
      }
    });
    console.log(counts, "counts");
    return counts;
  }, [allMessages, user?.id]);

  const getOtherUser = useCallback(
    (chat) => {
      return chat?.users?.find((u) => u?.id !== user?.id);
    },
    [user?.id],
  );

  const fetchChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/chat/my`, { withCredentials: true });
      const allChats = res.data.chats || [];

      // 2. Faster Unique Filtering
      const uniqueMap = new Map();
      allChats.forEach((chat) => {
        const other = getOtherUser(chat);
        if (other && !uniqueMap.has(other.id)) {
          uniqueMap.set(other.id, chat);
        }
      });

      dispatch(setChats(Array.from(uniqueMap.values())));
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }, [user?.id, dispatch, getOtherUser]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;
    const handleRefresh = () => fetchChats();
    socket.on("receive-message", handleRefresh);
    socket.on("message-read", handleRefresh);
    return () => {
      socket.off("receive-message", handleRefresh);
      socket.off("message-read", handleRefresh);
    };
  }, [fetchChats]);

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-[#111827]">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold dark:text-white">Chats</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 cursor-pointer bg-blue-50 dark:bg-blue-600/10 text-blue-600 rounded-xl hover:scale-105 transition-transform"
        >
          <UserRoundPlus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat);
              if (!otherUser) return null;

              const isSelected = selectedChat?.id === chat.id;
              const unreadCount = unreadMap[chat.id] || 0;
              const lastMessage = chat.messages?.[0];

              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={cn(
                    "flex items-center gap-4 border-2  rounded-md w-full p-4 transition-all relative  border-gray-50 dark:border-gray-800/50",
                    isSelected
                      ? "bg-blue-50/50 dark:bg-blue-600/5"
                      : "hover:bg-gray-50 dark:hover:bg-white/[0.02]",
                  )}
                >
                  {/* Avatar Section */}
                  <div className="relative">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {otherUser.avatar ? (
                        <img
                          src={otherUser.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        otherUser.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Status Dot Example */}
                    {/* <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#111827] rounded-full" /> */}
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold dark:text-white truncate">
                        {otherUser.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={cn(
                          "text-sm truncate mr-2",
                          unreadCount > 0
                            ? "text-gray-900 dark:text-gray-100 font-medium"
                            : "text-gray-500",
                        )}
                      >
                        {lastMessage?.text || "New conversation"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ChatRequestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
