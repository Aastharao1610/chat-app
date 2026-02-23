// "use client";
// import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { UserRoundPlus } from "lucide-react";
// import ChatRequestModal from "../ChatrequestModal/chatRequestModal";
// import { useCallback } from "react";
// import { setChats } from "@/store/chatSlice";

// export default function ChatList({ onSelectChat, selectedChat }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const chats = useSelector((state) => state.chat.chats);
//   const allMessages = useSelector((state) => state.chat.messages);

//   //  Real time chat update
//   const getUnreadCount = (chatId) => {
//     return allMessages.filter(
//       (msg) => msg.chatId === chatId && msg.receiverId === user.id && !msg.read,
//     ).length;
//   };

//   const getOtherUser = (chat) => {
//     if (!chat?.users || !Array.isArray(chat.users)) return null;
//     if (!user?.id) return null;
//     return chat.users.find((u) => u?.id && u.id !== user.id);
//   };

//   // fetching the chats

//   const fetchChats = useCallback(async () => {
//     console.log("Fetching Chats");
//     try {
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND}/api/chat/my`,
//         {
//           withCredentials: true,
//         },
//       );
//       console.log(res, "res");
//       const allChats = res.data.chats || [];
//       const counts = {};
//       const uniqueChats = [];

//       for (const chat of allChats) {
//         const other = getOtherUser(chat);
//         if (!other) continue;

//         const exists = uniqueChats.find(
//           (c) => getOtherUser(c)?.id === other.id,
//         );
//         if (!exists) {
//           uniqueChats.push(chat);

//           const unread = chat.messages?.filter(
//             (msg) => msg.receiverId === user.id && !msg.read,
//           ).length;

//           if (unread > 0) counts[chat.id] = unread;
//         }
//       }
//       console.log("📬 ChatList updated:", new Date().toLocaleTimeString());
//       console.log("🔥 Full fetched chat list:", allChats);
//       dispatch(setChats(uniqueChats));
//       // setUnreadCounts(counts);

//       console.log("👀 Updated uniqueChats:", uniqueChats);
//       console.log("📊 Updated unread counts:", counts);
//     } catch (err) {
//       console.error("Error fetching chats:", err);
//     }
//   }, [user?.id]);

//   // Initial Load
//   useEffect(() => {
//     if (user?.id) {
//       fetchChats();
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     const socket = window.socket;
//     if (!socket || !user?.id) return;

//     const handleRefresh = () => fetchChats();

//     socket.on("receive-message", handleRefresh);

//     socket.on("messages-read", handleRefresh);

//     return () => {
//       socket.off("receive-message", handleRefresh);
//       socket.off("message-read", handleRefresh);
//     };
//   }, [user?.id, fetchChats]);
//   return (
//     <div className="p-4 w-full">
//       <div className="flex justify-between mb-4">
//         <h2 className="text-xl font-bold  text-blue-600">Messages</h2>
//         <button onClick={() => setIsModalOpen(true)}>
//           <UserRoundPlus
//             size={22}
//             className="text-blue-600 hover:scale-110 transition"
//           />
//         </button>
//       </div>

//       {!user?.id ? (
//         <p className="text-gray-400 text-sm">Loading user data...</p>
//       ) : chats.length === 0 ? (
//         <p className="text-gray-400 text-sm">You have no chats yet.</p>
//       ) : (
//         chats.map((chat) => {
//           const otherUser = getOtherUser(chat);
//           if (!otherUser) return null;

//           const lastMessage = chat.messages?.[0];

//           const unreadCount = getUnreadCount(chat.id);

//           return (
//             <div
//               key={chat.id}
//               onClick={() => onSelectChat(chat)}
//               className={`flex items-center justify-between p-4 my-3 rounded-lg cursor-pointer transition-all border ${
//                 selectedChat?.id === chat.id
//                   ? "bg-blue-100 border-blue-400"
//                   : "hover:bg-blue-50 border-gray-200"
//               }`}
//             >
//               <div className="flex my-3 items-center gap-3">
//                 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
//                   {otherUser?.name?.charAt(0) || "?"}
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-800">
//                     {otherUser?.name || "Unknown"}
//                   </p>
//                   <p className="text-sm text-gray-500 truncate max-w-[180px]">
//                     {lastMessage?.text || "No messages yet"}
//                   </p>
//                 </div>
//               </div>

//               {unreadCount > 0 && (
//                 <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full min-w-[20px] text-center">
//                   {unreadCount}
//                 </div>
//               )}
//             </div>
//           );
//         })
//       )}

//       <ChatRequestModal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </div>
//   );
// }

"use client";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { UserRoundPlus } from "lucide-react";
import ChatRequestModal from "../../../../components/modal/ChatrequestModal/chatRequestModal";
import { setChats } from "@/store/chatSlice";
import { cn } from "@/lib/utils";

export default function ChatList({ onSelectChat, selectedChat }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const chats = useSelector((state) => state.chat.chats);
  const allMessages = useSelector((state) => state.chat.messages);

  const getUnreadCount = (chatId) => {
    return allMessages.filter(
      (msg) =>
        msg.chatId === chatId && msg.receiverId === user?.id && !msg.read,
    ).length;
  };

  const getOtherUser = (chat) => {
    if (!chat?.users || !Array.isArray(chat.users)) return null;
    return chat.users.find((u) => u?.id && u.id !== user?.id);
  };

  const fetchChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/chat/my`, { withCredentials: true });

      const allChats = res.data.chats || [];
      const uniqueChats = [];

      for (const chat of allChats) {
        const other = getOtherUser(chat);
        if (!other) continue;

        const exists = uniqueChats.find(
          (c) => getOtherUser(c)?.id === other.id,
        );
        if (!exists) uniqueChats.push(chat);
      }

      dispatch(setChats(uniqueChats));
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    const socket = window.socket;
    if (!socket || !user?.id) return;

    const handleRefresh = () => fetchChats();
    socket.on("receive-message", handleRefresh);
    socket.on("messages-read", handleRefresh);

    return () => {
      socket.off("receive-message", handleRefresh);
      socket.off("messages-read", handleRefresh);
    };
  }, [user?.id, fetchChats]);

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-[#121b22]">
      {/* Responsive Header */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-white dark:bg-[#121b22] z-10 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl md:text-2xl font-bold text-blue-600 tracking-tight">
          Messages
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
        >
          <UserRoundPlus size={24} className="text-blue-600" />
        </button>
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!user?.id ? (
          <div className="p-8 text-center animate-pulse text-gray-400">
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No conversations yet.</p>
            <p className="text-xs mt-1 text-gray-400">
              Start a new chat to see it here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat);
              if (!otherUser) return null;

              const lastMessage = chat.messages?.[0];
              const unreadCount = getUnreadCount(chat.id);
              const isSelected = selectedChat?.id === chat.id;

              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={cn(
                    "flex items-center gap-3 w-full p-4 transition-all border-2 border-gray-200 dark:border-gray-800 rounded-2xl outline-none text-left",
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100",
                  )}
                >
                  {/* Avatar with Responsive Sizing */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center  text-white text-lg font-bold shadow-sm">
                      {otherUser?.avatar ? (
                        <img
                          src={otherUser.avatar}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        otherUser?.name?.charAt(0) || "?"
                      )}
                    </div>
                    {/* Optional Online Indicator */}
                    {/* <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#121b22] rounded-full"></div> */}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3
                        className={cn(
                          "font-semibold truncate text-[15px] md:text-base",
                          unreadCount > 0
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300",
                        )}
                      >
                        {otherUser?.name || "Unknown"}
                      </h3>
                      {lastMessage && (
                        <span className="text-[10px] md:text-xs text-gray-400 whitespace-nowrap ml-2">
                          {/* Use a simple time formatter here */}
                          12:45 PM
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <p
                        className={cn(
                          "text-sm truncate pr-4",
                          unreadCount > 0
                            ? "text-blue-600 dark:text-blue-400 font-medium"
                            : "text-gray-500 dark:text-gray-400",
                        )}
                      >
                        {lastMessage?.text || "Started a conversation"}
                      </p>

                      {unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center animate-in zoom-in">
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
