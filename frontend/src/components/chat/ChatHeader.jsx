// "use client";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { Video, Phone, Users, ChevronDown } from "lucide-react";
// import { getSocket } from "@/lib/socket";

// const ChatHeader = ({ selectedUser }) => {
//   const { user: currentUser } = useSelector((state) => state.auth);
//   const [isTyping, setIsTyping] = useState(false);
//   const [isOnline, setIsOnline] = useState(false);

// useEffect(() => {
//   const socket = window.socket;
//   if (!socket || !user) return;

//   socket.on("user-online", (id) => {
//     if (id === selectedUser.id) setOnline(true);
//   });

//   socket.on("user-offline", (id) => {
//     if (id === selectedUser.id) setOnline(false);
//   });

//   return () => {
//     socket.off("user-online");
//     socket.off("user-offline");
//   };
// }, [selectedUser]);

//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket || !selectedUser?.id) return;

//     socket.emit("join-user", currentUser.id);

//     const handleTyping = ({ from }) => {
//       if (from === selectedUser.id) setIsTyping(true);
//     };

//     const handleStopTyping = ({ from }) => {
//       if (from === selectedUser.id) setIsTyping(false);
//     };

//     const handleOnline = (userId) => {
//       if (userId === selectedUser.id) setIsOnline(true);
//     };

//     const handleOffline = (userId) => {
//       if (userId === selectedUser.id) setIsOnline(false);
//     };

//     const handleOnlineUsers = (userIds) => {
//       if (userIds.includes(selectedUser.id)) setIsOnline(true);
//     };

//     socket.on("typing", handleTyping);
//     socket.on("stop-typing", handleStopTyping);
//     socket.on("user-online", handleOnline);
//     socket.on("user-offline", handleOffline);
//     socket.on("online-users", handleOnlineUsers);

//     return () => {
//       socket.off("typing", handleTyping);
//       socket.off("stop-typing", handleStopTyping);
//       socket.off("user-online", handleOnline);
//       socket.off("user-offline", handleOffline);
//       socket.off("online-users", handleOnlineUsers);
//     };
//   }, [selectedUser]);

//   if (!selectedUser) {
//     return (
//       <div className="px-4 py-3 border-b bg-white text-gray-500">
//         No user selected
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-between items-center px-4 py-3 border-b bg-white shadow-sm">
//       <div className="flex items-center gap-3">
//         <img
//           src={`https://ui-avatars.com/api/?name=${selectedUser.name}`}
//           alt="avatar"
//           className="w-10 h-10 rounded-full"
//         />
//         <div>
//           <p className="font-medium text-gray-900">{selectedUser.name}</p>
//           <p className="text-xs text-gray-500">
//             {isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}
//           </p>
//         </div>
//       </div>

//       <div className="flex items-center gap-4">
//         <Phone className="text-gray-600 cursor-pointer hover:text-black" />
//         <Video className="text-gray-600 cursor-pointer hover:text-black" />
//         <Users className="text-gray-600 cursor-pointer hover:text-black" />
//         {/* <ChevronDown className="text-gray-600 cursor-pointer hover:text-black" /> */}
//       </div>
//     </div>
//   );
// };

// export default ChatHeader;

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ChatHeader({ selectedUser }) {
  const { user } = useSelector((state) => state.auth);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const socket = window.socket;
    if (!socket || !selectedUser?.id) return;

    const handleTyping = (data) => {
      if (data.senderId === selectedUser.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000); // Reset after 2s
      }
    };

    const handleOnline = (id) => {
      if (id === selectedUser.id) setIsOnline(true);
    };

    const handleOffline = (id) => {
      if (id === selectedUser.id) setIsOnline(false);
    };

    socket.on("typing", handleTyping);
    socket.on("user-online", handleOnline);
    socket.on("user-offline", handleOffline);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("user-online", handleOnline);
      socket.off("user-offline", handleOffline);
    };
  }, [selectedUser]);
  useEffect(() => {
    const socket = window.socket;
    if (!socket || !selectedUser?.id) return;

    const showTyping = ({ from }) => {
      if (from === selectedUser.id) {
        setIsTyping(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setIsTyping(false), 2000);
      }
    };

    let typingTimeout;

    socket.on("typing", showTyping);
    return () => {
      socket.off("typing", showTyping);
      clearTimeout(typingTimeout);
    };
  }, [selectedUser]);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <div>
        <p className="font-semibold">{selectedUser?.name}</p>
        <p className="text-xs text-gray-500">
          {isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
}
