"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { FaCircle } from "react-icons/fa";
import ChatRequestModal from "../ChatrequestModal/chatRequestModal";
import { UserRoundPlus } from "lucide-react";

export default function ChatList({ onSelectChat, selectedChat }) {
  const [chats, setChats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  console.log("🧠 Redux user from auth state:", user);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/chat/my", {
          withCredentials: true,
        });
        console.log("✅ Chats fetched:", res.data.chats);
        setChats(res.data.chats || []);
      } catch (err) {
        console.error(" Error fetching chats:", err);
      }
    };

    if (user && user.id) {
      console.log("📥 Fetching chats for user:", user.id);
      fetchChats();
    }
  }, [user]);

  const getOtherUser = (chat) => {
    if (!chat?.users || !Array.isArray(chat.users)) return null;
    if (!user?.id) return null;
    return chat.users.find((u) => u?.id && u.id !== user.id);
  };

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Messages</h2>
        <div>
          <button
            className="cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <UserRoundPlus
              size={22}
              className="text-blue-600 cursor-pointer hover:scale-110 transition"
            />
          </button>
        </div>
      </div>

      {!user?.id ? (
        <p className="text-gray-400 text-sm">Loading user data...</p>
      ) : chats.length === 0 ? (
        <p className="text-gray-400 text-sm">You have no chats yet.</p>
      ) : (
        chats.map((chat) => {
          const otherUser = getOtherUser(chat);
          if (!otherUser) return null;

          const lastMessage = chat.messages?.[chat.messages.length - 1];

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border ${
                selectedChat?.id === chat.id
                  ? "bg-blue-100 border-blue-400"
                  : "hover:bg-blue-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
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
              {!lastMessage?.read && lastMessage?.receiverId === user?.id && (
                <FaCircle className="text-blue-400 text-xs" />
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
