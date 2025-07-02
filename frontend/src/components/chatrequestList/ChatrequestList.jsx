"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Check, CheckCheck } from "lucide-react";
import { toast } from "react-toastify";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const renderTickIcon = (read) => {
  return read ? (
    <CheckCheck size={16} className="text-blue-500" />
  ) : (
    <Check size={16} className="text-gray-400" />
  );
};

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const { user } = useSelector((state) => state.auth); // current user

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/chat/my", {
          withCredentials: true,
        });
        setChats(res.data.chats || []);
      } catch (err) {
        toast.error("Failed to load chats");
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      <h2 className="text-xl  font-bold mb-6 tracking-wide text-black">
        Messages
      </h2>

      {chats.length === 0 ? (
        <p className="text-center text-gray-400">No chats available</p>
      ) : (
        chats.map((chat) => {
          const otherUser =
            chat.users.find((u) => u.id !== user.id) || chat.users[0];

          const lastMessage = chat.messages?.[chat.messages.length - 1];

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              {/* Left: Avatar + Name + Last Message */}
              <div className="flex items-center gap-3">
                <div className="bg-gray-300 w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold">
                  {getInitials(otherUser.name)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{otherUser.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>

              {/* Right: Time + Ticks */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400">
                  {formatTime(lastMessage?.createdAt)}
                </span>
                {lastMessage && renderTickIcon(lastMessage.read)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChatList;
