"use client";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import ChatInput from "../ChatInput/ChatInput";
import ChatHeader from "../chat/ChatHeader";
import { CheckCheck } from "lucide-react";
import { setMessages, addMessage } from "@/store/chatSlice";

export default function ChatMessages({ selectedChat }) {
  // const [messages, setMessages] = useState([]);
  const dispatch = useDispatch();

  const messages = useSelector((state) => state.chat.messages);

  // Use `messages` from Redux and they’ll update when socket dispatches `addMessage`

  const { user } = useSelector((state) => state.auth);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const selectedChatRef = useRef(selectedChat); // ✅ to avoid stale selectedChat

  const socket = typeof window !== "undefined" ? window.socket : null;

  // Keep selectedChatRef updated
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat?.id) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  const grouped = useMemo(() => {
    const map = {};
    messages.forEach((msg) => {
      const label = formatDateLabel(msg.createdAt);
      if (!map[label]) map[label] = [];
      map[label].push(msg);
    });
    return map;
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?.id) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/message/${selectedChat.id}`,
          { withCredentials: true }
        );
        dispatch(setMessages(res.data.messages || []));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    const unread = messages.some(
      (msg) => msg.receiverId === user?.id && !msg.read
    );

    const markMessagesAsRead = async () => {
      try {
        await axios.patch(
          `http://localhost:5000/api/message/messages/read/${selectedChat.id}`,
          {},
          { withCredentials: true }
        );

        dispatch(
          setMessages((prev) =>
            prev.map((msg) =>
              msg.receiverId === user.id ? { ...msg, read: true } : msg
            )
          )
        );
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    if (selectedChat?.id && unread) {
      markMessagesAsRead();
    }
  }, [selectedChat, messages]);

  // const handleNewMessage = useCallback(
  //   (message) => {
  //     const chat = selectedChatRef.current;

  //     if (message.chatId === chat?.id) {
  //       const senderUser = chat?.users?.find((u) => u.id === message.senderId);
  //       console.log(
  //         `📩 ${user?.name} received: "${message.text}" from ${
  //           senderUser?.name || message.senderId
  //         }`
  //       );
  //       setMessages((prev) => [...prev, message]);
  //     } else {
  //       console.log(
  //         `🔕 ${user?.name} ignored message for chatId=${message.chatId}`,
  //         message.text
  //       );
  //     }
  //   },
  //   [user]
  // );

  const handleNewMessage = useCallback(
    (message) => {
      const chat = selectedChatRef.current;

      if (message.chatId !== chat?.id) return;

      const alreadyExists = messages.some((m) => m.id === message.id);
      if (alreadyExists) return;

      dispatch(addMessage(message)); // ✅ correct
    },
    [messages, dispatch]
  );

  useEffect(() => {
    if (!socket) return;

    console.log("📡 Listening for new messages on socket...");
    socket.on("receive-message", handleNewMessage);

    return () => {
      socket.off("receive-message", handleNewMessage);
    };
  }, [socket]);

  if (!selectedChat || !selectedChat.users) {
    return (
      <div className="flex justify-center items-center h-full text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  const otherUser = selectedChat.users.find((u) => u.id !== user?.id);
  const receiverId = otherUser?.id;
  const addNewMessage = (msg) => dispatch(addMessage(msg));
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-col h-full w-[947px]"
    >
      <ChatHeader selectedUser={otherUser} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
        {Object.entries(grouped).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="text-center text-xs text-gray-500 mb-2">
              {dateLabel}
            </div>
            {msgs.map((msg) => {
              const isSender = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div className="flex flex-col max-w-[70%]">
                    {!isSender && (
                      <span className="text-xs text-gray-500 mb-1 ml-1">
                        {
                          selectedChat.users.find((u) => u.id === msg.senderId)
                            ?.name
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
            onSend={addNewMessage}
            receiverUser={otherUser}
          />
        ) : (
          <p className="text-sm text-red-500">Receiver not found.</p>
        )}
      </div>
    </div>
  );
}
