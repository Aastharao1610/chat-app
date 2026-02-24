// "use client";
// import { usePathname } from "next/navigation";
// import ChatList from "../chatlist/chatList/chatlist";
// import ChatRequestList from "../chatlist/chatrequestList/ChatrequestList";
// import PrivateChatlist from "../chatlist/privateChatList/privateChatlist";

// export default function SecondSidebar({ onSelectChat, selectedChat }) {
//   const pathname = usePathname();

//   const headerTitle = titles[pathname] || "Unknown";

//   const renderContent = () => {
//     if (pathname === "/chat")
//       return (
//         <ChatList onSelectChat={onSelectChat} selectedChat={selectedChat} />
//       );
//     if (pathname === "/chat/requests") return <ChatRequestList />;
//     if (pathname === "/chat/private") return <PrivateChatlist />;
//     return <div className="p-4 text-gray-500">No content</div>;
//   };

//   return (
//     <aside className="w-full h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] flex flex-col">
//       <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//         <h2 className="text-lg md:text-xl font-bold tracking-wide text-gray-800 dark:text-white">
//           {headerTitle}
//         </h2>
//       </div>

// <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2">
//   {renderContent()}
// </div>
//     </aside>
//   );
// }

"use client";
import { usePathname } from "next/navigation";
import ChatList from "../chatlist/chatList/chatlist";
import ChatRequestList from "../chatlist/chatrequestList/ChatrequestList";
import PrivateChatList from "../chatlist/privateChatList/privateChatlist"; // Fixed Capital P

const titles = {
  "/chat": "Messages",
  "/requests": "Requests",
  "/private": "Private Chats",
  "/groups": "Groups",
};

export default function SecondSidebar({ onSelectChat, selectedChat }) {
  const pathname = usePathname();

  const renderContent = () => {
    switch (pathname) {
      case "/chat":
        return (
          <ChatList onSelectChat={onSelectChat} selectedChat={selectedChat} />
        );
      case "/requests":
        return <ChatRequestList />;
      case "/private":
        return <PrivateChatList />; // Fixed Capital P
      case "/groups":
        return <div className="p-4 text-gray-500 text-center">Groups</div>;
      default:
        return (
          <div className="p-4 text-gray-500 text-center">Select a category</div>
        );
    }
  };

  return (
    <aside className="w-full h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">
          {titles[pathname] || "Chat"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2">
        {renderContent()}
      </div>
    </aside>
  );
}
