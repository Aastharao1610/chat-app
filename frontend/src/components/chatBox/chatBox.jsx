"use client";
import { useState } from "react";
import ChatMessages from "../ChatMessage/ChatMessage";
import SecondSidebar from "./secondSideBar";

export default function ChatBox() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-screen">
      {/* Use second sidebar instead of hardcoded ChatList */}
      <div className="w-[300px] border-r border-gray-300">
        <SecondSidebar
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
        />
      </div>

      {/* Right Panel - Messages */}
      <div className="flex-1 flex flex-col ">
        {selectedChat ? (
          <ChatMessages selectedChat={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";
// import { useState } from "react";
// import ChatMessages from "../ChatMessage/ChatMessage";
// import SecondSidebar from "./secondSideBar";
// import { cn } from "@/lib/utils";

// export default function ChatBox() {
//   const [selectedChat, setSelectedChat] = useState(null);

//   return (
//     <div className="flex h-full w-full">
//       {/* LEFT PANEL: Chat List */}
//       <div
//         className={cn(
//           "w-full md:w-[350px] border-r border-gray-300 h-full flex-shrink-0",
//           selectedChat ? "hidden md:block" : "block", // Hide list on mobile if chat is selected
//         )}
//       >
//         <SecondSidebar
//           onSelectChat={setSelectedChat}
//           selectedChat={selectedChat}
//         />
//       </div>

//       {/* RIGHT PANEL: Messages */}
//       <div
//         className={cn(
//           "flex-1 flex flex-col h-full bg-gray-50",
//           !selectedChat ? "hidden md:flex" : "flex", // Hide message area on mobile if NO chat is selected
//         )}
//       >
//         {selectedChat ? (
//           <ChatMessages
//             selectedChat={selectedChat}
//             onBack={() => setSelectedChat(null)} // Add a back button prop
//           />
//         ) : (
//           <div className="hidden md:flex items-center justify-center h-full text-gray-500">
//             Select a chat to start messaging
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
