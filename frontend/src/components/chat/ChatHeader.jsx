"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Phone, Video, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { useAudioCall } from "@/hooks/useAudioCall";
import AudioCallUI from "../Call/AudioCall/audioCall";
import { useVideoCall } from "@/hooks/useVideoCall";
import VideoCallUI from "../Call/videoCall/videoCall";

export default function ChatHeader({ selectedUser, onBack }) {
  // Added onBack prop
  const [isTyping, setIsTyping] = useState(false);
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const isOnline = onlineUsers.some((id) => id == selectedUser?.id);
  const { user } = useSelector((state) => state.auth);

  const callLogic = useAudioCall(selectedUser);
  const videoLogic = useVideoCall(selectedUser);

  useEffect(() => {
    const socket = window.socket;
    if (!socket || !selectedUser?.id) return;
    let typingTimeout;

    const handleTyping = ({ from }) => {
      if (String(from) === String(selectedUser.id)) {
        setIsTyping(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setIsTyping(false), 2500);
      }
    };

    socket.on("typing", handleTyping);
    return () => {
      socket.off("typing", handleTyping);
      clearTimeout(typingTimeout);
    };
  }, [selectedUser?.id]);

  return (
    <>
      <div className="flex flex-col bg-white dark:bg-[#202c33]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {/* BACK BUTTON: Only visible on mobile */}
            <button
              onClick={onBack}
              className="md:hidden p-1 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>

            <div>
              <p className="font-semibold">{selectedUser?.name}</p>
              <p className="text-xs font-medium">
                {isTyping ? (
                  <span className="text-green-500 animate-pulse">
                    Typing...
                  </span>
                ) : isOnline ? (
                  <span className="text-blue-500">Online</span>
                ) : (
                  <span className="text-gray-400">Offline</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-2 md:gap-4">
            <button
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-200 duration-300"
              onClick={callLogic.startCall}
            >
              <Phone size={20} className="md:w-6 md:h-6" />
            </button>

            <button
              onClick={videoLogic.startCall}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-200 duration-300"
            >
              <Video size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
        </div>
        <AudioCallUI {...callLogic} />
        <VideoCallUI {...videoLogic} />
      </div>
    </>
  );
}
