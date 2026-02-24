"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import ChatInput from "../ChatInput/ChatInput";
import ChatHeader from "@/components/layout/ChatHeader";
import { CheckCheck } from "lucide-react";
import { setMessages } from "@/store/chatSlice";

export default function ChatMessages({ selectedChat, onBack }) {
  const [callLogs, setCallLogs] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const allMessages = useSelector((state) => state.chat.messages);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Track selected chat globally for real-time filtering
  useEffect(() => {
    if (selectedChat?.id) {
      window.selectedChatId = selectedChat.id;
    }
  }, [selectedChat]);

  // Filter only messages for the current chat
  const chatMessages = useMemo(() => {
    if (!selectedChat?.id) return [];
    return allMessages.filter((msg) => msg.chatId === selectedChat.id);
  }, [allMessages, selectedChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?.id) return;
      try {
        const res = await axios.get(`/api/message/${selectedChat.id}`, {
          withCredentials: true,
        });
        dispatch(setMessages(res.data.messages || []));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };
  const formatCallDuration = (seconds) => {
    if (!seconds || seconds <= 0) {
      return "00:00";
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };
  useEffect(() => {
    const fetchCalls = async () => {
      if (!selectedChat?.users || !user?.id) return;
      const otherUser = selectedChat.users.find((u) => u.id !== user.id);
      if (!otherUser) return;

      try {
        const res = await axios.get(`/api/calls/${user.id}/${otherUser.id}`);
        console.log(res.data);
        setCallLogs(res.data || []);
      } catch (error) {
        console.error("Error Fetching calls :", error);
      }
    };
    fetchCalls();
  }, [selectedChat, user?.id]);
  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const combinedTimeline = useMemo(() => {
    const formattedMessages = chatMessages.map((msg) => ({
      id: msg.id,
      type: "message",
      createdAt: msg.createdAt,
      data: msg,
    }));

    const formattedCalls = callLogs.map((call) => ({
      id: call.id,
      type: "call",
      createdAt: call.createdAt,
      data: call,
    }));

    return [...formattedMessages, ...formattedCalls].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [chatMessages, callLogs]);

  const grouped = useMemo(() => {
    const map = {};

    combinedTimeline.forEach((item) => {
      const label = formatDateLabel(item.createdAt);
      if (!map[label]) map[label] = [];
      map[label].push(item);
    });

    return map;
  }, [combinedTimeline]);

  if (!user || !selectedChat || !selectedChat.users) {
    return (
      <div className="flex justify-center items-center h-full text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  const otherUser = selectedChat?.users?.find((u) => u.id !== user?.id);

  const receiverId = otherUser?.id;
  useEffect(() => {
    const markMessagesAsRead = async () => {
      //checking if there is any unread message
      const unread = chatMessages.some(
        (msg) => msg.receiverId === user?.id && !msg.read,
      );

      if (selectedChat?.id && unread) {
        try {
          await axios.patch(
            `/api/message/messages/read/${selectedChat.id}`,
            {},
            { withCredentials: true },
          );
          // update redux state
          const updatedMessages = chatMessages.map((msg) =>
            msg.receiverId === user.id ? { ...msg, read: true } : msg,
          );

          dispatch(setMessages(updatedMessages));
          if (window.socket) {
            window.socket.emit("mark-read", {
              chatId: selectedChat.id,
              readerId: user.id,
              senderId: otherUser.id,
            });
          }
        } catch (err) {
          console.error("Error marking messages as read:", err);
        }
      }
    };

    markMessagesAsRead();
  }, [chatMessages, selectedChat, user.id, otherUser?.id]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-col h-full"
    >
      <ChatHeader selectedUser={otherUser} onBack={onBack} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
        {Object.entries(grouped).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="text-center text-xs text-gray-500 mb-2">
              {dateLabel}
            </div>

            {msgs.map((item) => {
              if (item.type === "message") {
                const msg = item.data;
                const isSender = msg.senderId === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div className="flex flex-col max-w-[70%]">
                      {isSender && (
                        <span className="text-xs text-gray-500 mb-1 ml-1">
                          {
                            selectedChat.users.find(
                              (u) => u.id === msg.senderId,
                            )?.name
                          }
                        </span>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm relative ${
                          isSender
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white text-black border border-gray-200 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                        <div className="flex items-center justify-end text-xs gap-1 text-gray-300 mt-1">
                          <span>{formatTime(msg.createdAt)}</span>
                          {isSender &&
                            (msg.read ? (
                              <CheckCheck className="w-4 h-4 text-white" />
                            ) : (
                              <CheckCheck className="w-4 h-4 text-gray-500" />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              if (item.type === "call") {
                const call = item.data;
                const isOutgoing = call.callerId === user.id;

                return (
                  <div key={call.id} className="flex justify-center my-3">
                    <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-700 border">
                      {call.status === "MISSED" && (
                        <span className="text-red-500">
                          📞 Missed {call.type.toLowerCase()} Call
                        </span>
                      )}

                      {call.status === "COMPLETED" && (
                        <>
                          📞 {isOutgoing ? "Outgoing" : "Incoming"}{" "}
                          {call.type.toLowerCase()} Call •{" "}
                          {formatCallDuration(call.duration)}
                        </>
                      )}

                      {call.status === "REJECTED" && (
                        <span>📞 {call.type.toLowerCase()} Call Rejected</span>
                      )}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t">
        {receiverId ? (
          <ChatInput
            chatId={selectedChat.id}
            receiverId={receiverId}
            receiverUser={otherUser}
          />
        ) : (
          <p className="text-sm text-red-500">Receiver not found.</p>
        )}
      </div>
    </div>
  );
}
