// "use client";
// import { useEffect, useState, useMemo, useRef } from "react";
// import axios from "axios";
// import { useSelector, useDispatch } from "react-redux";
// import ChatInput from "../ChatInput/ChatInput";
// import ChatHeader from "../chat/ChatHeader";
// import { CheckCheck } from "lucide-react";
// import { setMessages } from "@/store/chatSlice";
// import { Phone } from "lucide-react";
// import { getMicroPhone } from "@/webrtc/audio";

// export default function ChatMessages({ selectedChat, onBack }) {
//   const [callLogs, setCallLogs] = useState([]);
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const allMessages = useSelector((state) => state.chat.messages);

//   const containerRef = useRef(null);
//   const bottomRef = useRef(null);
//   const [isAtBottom, setIsAtBottom] = useState(true);

//   // Track selected chat globally for real-time filtering
//   useEffect(() => {
//     if (selectedChat?.id) {
//       window.selectedChatId = selectedChat.id;
//     }
//   }, [selectedChat]);

//   // Filter only messages for the current chat
//   const chatMessages = useMemo(() => {
//     if (!selectedChat?.id) return [];
//     return allMessages.filter((msg) => msg.chatId === selectedChat.id);
//   }, [allMessages, selectedChat]);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!selectedChat?.id) return;
//       try {
//         const res = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND}/api/message/${selectedChat.id}`,
//           { withCredentials: true },
//         );
//         dispatch(setMessages(res.data.messages || []));
//       } catch (err) {
//         console.error("Error fetching messages:", err);
//       }
//     };

//     fetchMessages();
//   }, [selectedChat]);

//   useEffect(() => {
//     if (isAtBottom) {
//       bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [chatMessages]);

//   const handleScroll = () => {
//     const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//     setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     const ampm = hours >= 12 ? "pm" : "am";
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
//   };
//   useEffect(() => {
//     const fetchCalls = async () => {
//       if (!selectedChat?.users || !user?.id) return;
//       const otherUser = selectedChat.users.find((u) => u.id !== user.id);
//       if (!otherUser) return;

//       try {
//         const res = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND}/api/calls/${user.id}/${otherUser.id}`,
//         );
//         console.log(res.data);
//         setCallLogs(res.data || []);
//       } catch (error) {
//         console.error("Error Fetching calls :", error);
//       }
//     };
//     fetchCalls();
//   }, [selectedChat, user?.id]);
//   const formatDateLabel = (dateStr) => {
//     const date = new Date(dateStr);
//     const today = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);

//     if (date.toDateString() === today.toDateString()) return "Today";
//     if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

//     return date.toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const combinedTimeline = useMemo(() => {
//     const formattedMessages = chatMessages.map((msg) => ({
//       id: msg.id,
//       type: "message",
//       createdAt: msg.createdAt,
//       data: msg,
//     }));

//     const formattedCalls = callLogs.map((call) => ({
//       id: call.id,
//       type: "call",
//       createdAt: call.createdAt,
//       data: call,
//     }));

//     return [...formattedMessages, ...formattedCalls].sort(
//       (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
//     );
//   }, [chatMessages, callLogs]);

//   const grouped = useMemo(() => {
//     const map = {};

//     combinedTimeline.forEach((item) => {
//       const label = formatDateLabel(item.createdAt);
//       if (!map[label]) map[label] = [];
//       map[label].push(item);
//     });

//     return map;
//   }, [combinedTimeline]);

//   if (!user || !selectedChat || !selectedChat.users) {
//     return (
//       <div className="flex justify-center items-center h-full text-gray-400">
//         Select a chat to start messaging
//       </div>
//     );
//   }

//   const otherUser = selectedChat?.users?.find((u) => u.id !== user?.id);

//   const receiverId = otherUser?.id;
//   useEffect(() => {
//     const markMessagesAsRead = async () => {
//       //checking if there is any unread message
//       const unread = chatMessages.some(
//         (msg) => msg.receiverId === user?.id && !msg.read,
//       );

//       if (selectedChat?.id && unread) {
//         try {
//           await axios.patch(
//             `${process.env.NEXT_PUBLIC_BACKEND}/api/message/messages/read/${selectedChat.id}`,
//             {},
//             { withCredentials: true },
//           );
//           // update redux state
//           const updatedMessages = chatMessages.map((msg) =>
//             msg.receiverId === user.id ? { ...msg, read: true } : msg,
//           );

//           dispatch(setMessages(updatedMessages));
//           if (window.socket) {
//             window.socket.emit("mark-read", {
//               chatId: selectedChat.id,
//               readerId: user.id,
//               senderId: otherUser.id,
//             });
//           }
//         } catch (err) {
//           console.error("Error marking messages as read:", err);
//         }
//       }
//     };

//     markMessagesAsRead();
//   }, [chatMessages, selectedChat, user.id, otherUser?.id]);

//   return (
//     <div
//       ref={containerRef}
//       onScroll={handleScroll}
//       className="flex flex-col h-full"
//     >
//       <ChatHeader selectedUser={otherUser} onBack={onBack} />

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
//         {Object.entries(grouped).map(([dateLabel, msgs]) => (
//           <div key={dateLabel}>
//             <div className="text-center text-xs text-gray-500 mb-2">
//               {dateLabel}
//             </div>

//             {msgs.map((item) => {
//               if (item.type === "message") {
//                 const msg = item.data;
//                 const isSender = msg.senderId === user.id;

//                 return (
//                   <div
//                     key={msg.id}
//                     className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}
//                   >
//                     <div className="flex flex-col max-w-[70%]">
//                       {isSender && (
//                         <span className="text-xs text-gray-500 mb-1 ml-1">
//                           {
//                             selectedChat.users.find(
//                               (u) => u.id === msg.senderId,
//                             )?.name
//                           }
//                         </span>
//                       )}
//                       <div
//                         className={`px-4 py-2 rounded-2xl text-sm relative ${
//                           isSender
//                             ? "bg-blue-500 text-white rounded-br-none"
//                             : "bg-white text-black border border-gray-200 rounded-bl-none"
//                         }`}
//                       >
//                         {msg.text}
//                         <div className="flex items-center justify-end text-xs gap-1 text-gray-300 mt-1">
//                           <span>{formatTime(msg.createdAt)}</span>
//                           {isSender &&
//                             (msg.read ? (
//                               <CheckCheck className="w-4 h-4 text-white" />
//                             ) : (
//                               <CheckCheck className="w-4 h-4 text-gray-500" />
//                             ))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               }
//               if (item.type === "call") {
//                 const call = item.data;
//                 const isOutgoing = call.callerId === user.id;

//                 return (
//                   <div key={call.id} className="flex justify-center my-3">
//                     <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-700 border">
//                       {call.status === "MISSED" && (
//                         <span className="text-red-500">📞 Missed Call</span>
//                       )}

//                       {call.status === "COMPLETED" && (
//                         <>
//                           📞 {isOutgoing ? "Outgoing" : "Incoming"} Call •{" "}
//                           {call.duration}s
//                         </>
//                       )}

//                       {call.status === "REJECTED" && (
//                         <span>📞 Call Rejected</span>
//                       )}
//                     </div>
//                   </div>
//                 );
//               }
//             })}
//           </div>
//         ))}
//         <div ref={bottomRef} />
//       </div>

//       <div className="p-4 border-t">
//         {receiverId ? (
//           <ChatInput
//             chatId={selectedChat.id}
//             receiverId={receiverId}
//             receiverUser={otherUser}
//           />
//         ) : (
//           <p className="text-sm text-red-500">Receiver not found.</p>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import ChatInput from "../ChatInput/ChatInput";
import ChatHeader from "../chat/ChatHeader";
import { CheckCheck } from "lucide-react";
import { setMessages } from "@/store/chatSlice";
import { cn } from "@/lib/utils";

export default function ChatMessages({ selectedChat, onBack }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const allMessages = useSelector((state) => state.chat.messages);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [callLogs, setCallLogs] = useState([]);

  // 1. Logic: Track selected chat for real-time filtering
  useEffect(() => {
    if (selectedChat?.id) {
      window.selectedChatId = selectedChat.id;
    }
  }, [selectedChat]);

  // 2. Logic: Filter messages for current chat
  const chatMessages = useMemo(() => {
    if (!selectedChat?.id) return [];
    return allMessages.filter((msg) => msg.chatId === selectedChat.id);
  }, [allMessages, selectedChat]);

  // 3. Logic: API Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?.id) return;
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/message/${selectedChat.id}`,
          { withCredentials: true },
        );
        dispatch(setMessages(res.data.messages || []));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [selectedChat, dispatch]);

  // 4. Logic: Fetch Call Logs
  useEffect(() => {
    const fetchCalls = async () => {
      if (!selectedChat?.users || !user?.id) return;
      const otherUser = selectedChat.users.find((u) => u.id !== user.id);
      if (!otherUser) return;

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/calls/${user.id}/${otherUser.id}`,
        );
        setCallLogs(res.data || []);
      } catch (error) {
        console.error("Error Fetching calls:", error);
      }
    };
    fetchCalls();
  }, [selectedChat, user?.id]);

  // 5. Logic: Auto-scroll & Read Status
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAtBottom]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  // 6. Formatting Helpers
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
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

  // 7. Timeline Construction
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
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
      <div className="flex justify-center items-center h-full text-gray-400 bg-gray-50">
        Select a chat to start messaging
      </div>
    );
  }

  const otherUser = selectedChat?.users?.find((u) => u.id !== user?.id);
  const receiverId = otherUser?.id;

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a]">
      {/* HEADER: Passing onBack for mobile navigation */}
      <ChatHeader selectedUser={otherUser} onBack={onBack} />

      {/* MESSAGES AREA */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4"
      >
        {Object.entries(grouped).map(([dateLabel, items]) => (
          <div key={dateLabel} className="space-y-3">
            <div className="flex justify-center my-6">
              <span className="bg-white/90 dark:bg-gray-800 px-3 py-1 rounded-lg text-[11px] font-medium text-gray-500 shadow-sm border border-gray-200 dark:border-gray-700 uppercase tracking-wider">
                {dateLabel}
              </span>
            </div>

            {items.map((item) => {
              if (item.type === "message") {
                const msg = item.data;
                const isSender = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full mb-1",
                      isSender ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-col relative",
                        isSender
                          ? "max-w-[85%] md:max-w-[70%]"
                          : "max-w-[85%] md:max-w-[70%]",
                      )}
                    >
                      {/* Optional: Show name in group chats */}
                      {!isSender && selectedChat.isGroup && (
                        <span className="text-[11px] text-gray-500 mb-1 ml-2">
                          {
                            selectedChat.users.find(
                              (u) => u.id === msg.senderId,
                            )?.name
                          }
                        </span>
                      )}

                      <div
                        className={cn(
                          "px-3 py-2 rounded-xl shadow-sm text-[15px] md:text-sm",
                          isSender
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700",
                        )}
                      >
                        <p className="leading-relaxed break-words">
                          {msg.text}
                        </p>
                        <div
                          className={cn(
                            "flex items-center justify-end text-[10px] mt-1 gap-1",
                            isSender ? "text-blue-100" : "text-gray-400",
                          )}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                          {isSender &&
                            (msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                            ) : (
                              <CheckCheck className="w-3.5 h-3.5" />
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
                  <div key={call.id} className="flex justify-center my-2">
                    <div className="bg-gray-200/50 dark:bg-gray-800/50 px-4 py-1.5 rounded-full text-[12px] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 backdrop-blur-sm">
                      {call.status === "MISSED" && (
                        <span className="text-red-500">📞 Missed Call</span>
                      )}
                      {call.status === "COMPLETED" && (
                        <span>
                          📞 {isOutgoing ? "Outgoing" : "Incoming"} •{" "}
                          {call.duration}s
                        </span>
                      )}
                      {call.status === "REJECTED" && (
                        <span>📞 Call Rejected</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 md:p-4  dark:bg-[#121b22] border-t border-gray-200 dark:border-gray-800">
        {receiverId ? (
          <ChatInput
            chatId={selectedChat.id}
            receiverId={receiverId}
            receiverUser={otherUser}
          />
        ) : (
          <p className="text-center text-xs text-red-500 py-2">
            Receiver not found.
          </p>
        )}
      </div>
    </div>
  );
}
