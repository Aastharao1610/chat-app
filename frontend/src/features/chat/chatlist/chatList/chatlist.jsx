// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
// import { UserRoundPlus } from "lucide-react";
// import ChatRequestModal from "../../../../components/modal/ChatrequestModal/chatRequestModal";
// import { setChats } from "@/store/chatSlice";
// import { cn } from "@/lib/utils";

// export default function ChatList({ onSelectChat, selectedChat }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const dispatch = useDispatch();

//   const { user } = useSelector((state) => state.auth);
//   const chats = useSelector((state) => state.chat.chats);
//   const allMessages = useSelector((state) => state.chat.messages);

//   const getUnreadCount = (chatId) => {
//     return allMessages.filter(
//       (msg) =>
//         msg.chatId === chatId && msg.receiverId === user?.id && !msg.read,
//     ).length;
//   };

//   const getOtherUser = (chat) => {
//     if (!chat?.users || !Array.isArray(chat.users)) return null;
//     return chat.users.find((u) => u?.id && u.id !== user?.id);
//   };

//   const fetchChats = useCallback(async () => {
//     if (!user?.id) return;
//     try {
//       const res = await axios.get(`/api/chat/my`, { withCredentials: true });

//       const allChats = res.data.chats || [];
//       const uniqueChats = [];

//       for (const chat of allChats) {
//         const other = getOtherUser(chat);
//         if (!other) continue;

//         const exists = uniqueChats.find(
//           (c) => getOtherUser(c)?.id === other.id,
//         );
//         if (!exists) uniqueChats.push(chat);
//       }

//       dispatch(setChats(uniqueChats));
//     } catch (err) {
//       console.error("Error fetching chats:", err);
//     }
//   }, [user?.id, dispatch]);

//   useEffect(() => {
//     fetchChats();
//   }, [fetchChats]);

//   useEffect(() => {
//     const socket = window.socket;
//     if (!socket || !user?.id) return;

//     const handleRefresh = () => fetchChats();
//     socket.on("receive-message", handleRefresh);
//     socket.on("messages-read", handleRefresh);

//     return () => {
//       socket.off("receive-message", handleRefresh);
//       socket.off("messages-read", handleRefresh);
//     };
//   }, [user?.id, fetchChats]);

//   return (
//     <div className="w-full flex flex-col h-full bg-white dark:bg-[#121b22]">
//       {/* Responsive Header */}
//       <div className="flex items-center justify-between p-4 sticky top-0 bg-white dark:bg-[#121b22] z-10 border-b border-gray-100 dark:border-gray-800">
//         <h2 className="text-xl md:text-2xl font-bold text-blue-600 tracking-tight">
//           Messages
//         </h2>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
//         >
//           <UserRoundPlus size={24} className="text-blue-600" />
//         </button>
//       </div>

//       {/* Scrollable List Container */}
//       <div className="flex-1 overflow-y-auto custom-scrollbar">
//         {!user?.id ? (
//           <div className="p-8 text-center animate-pulse text-gray-400">
//             Loading chats...
//           </div>
//         ) : chats.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             <p className="text-sm">No conversations yet.</p>
//             <p className="text-xs mt-1 text-gray-400">
//               Start a new chat to see it here.
//             </p>
//           </div>
//         ) : (
//           <div className="flex flex-col">
//             {chats.map((chat) => {
//               const otherUser = getOtherUser(chat);
//               if (!otherUser) return null;

//               const lastMessage = chat.messages?.[0];
//               const unreadCount = getUnreadCount(chat.id);
//               const isSelected = selectedChat?.id === chat.id;

//               return (
//                 <button
//                   key={chat.id}
//                   onClick={() => onSelectChat(chat)}
//                   className={cn(
//                     "flex items-center gap-3 w-full p-4 transition-all border-2 border-gray-200 dark:border-gray-800 rounded-2xl outline-none text-left",
//                     isSelected
//                       ? "bg-blue-50/80 dark:bg-blue-900/20"
//                       : "hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100",
//                   )}
//                 >
//                   {/* Avatar with Responsive Sizing */}
//                   <div className="relative flex-shrink-0">
//                     <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center  text-white text-lg font-bold shadow-sm">
//                       {otherUser?.avatar ? (
//                         <img
//                           src={otherUser.avatar}
//                           alt=""
//                           className="w-full h-full rounded-full object-cover"
//                         />
//                       ) : (
//                         otherUser?.name?.charAt(0) || "?"
//                       )}
//                     </div>
//                     {/* Optional Online Indicator */}
//                     {/* <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#121b22] rounded-full"></div> */}
//                   </div>

//                   {/* Text Content */}
//                   <div className="flex-1 min-w-0 pr-2">
//                     <div className="flex justify-between items-baseline mb-0.5">
//                       <h3
//                         className={cn(
//                           "font-semibold truncate text-[15px] md:text-base",
//                           unreadCount > 0
//                             ? "text-gray-900 dark:text-white"
//                             : "text-gray-700 dark:text-gray-300",
//                         )}
//                       >
//                         {otherUser?.name || "Unknown"}
//                       </h3>
//                       {lastMessage && (
//                         <span className="text-[10px] md:text-xs text-gray-400 whitespace-nowrap ml-2">
//                           {/* Use a simple time formatter here */}
//                           12:45 PM
//                         </span>
//                       )}
//                     </div>

//                     <div className="flex justify-between items-center">
//                       <p
//                         className={cn(
//                           "text-sm truncate pr-4",
//                           unreadCount > 0
//                             ? "text-blue-600 dark:text-blue-400 font-medium"
//                             : "text-gray-500 dark:text-gray-400",
//                         )}
//                       >
//                         {lastMessage?.text || "Started a conversation"}
//                       </p>

//                       {unreadCount > 0 && (
//                         <span className="flex-shrink-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center animate-in zoom-in">
//                           {unreadCount}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <ChatRequestModal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </div>
//   );
// }

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
    socket.on("messages-read", handleRefresh);
    return () => {
      socket.off("receive-message", handleRefresh);
      socket.off("messages-read", handleRefresh);
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
