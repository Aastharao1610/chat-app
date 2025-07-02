// "use client";
// import { usePathname } from "next/navigation";
// import ChatList from "./chatlist";
// import ChatRequestList from "../chatrequestList/ChatrequestList";
// import privateChatlist from "../privateChatList/privateChatlist";

// export default function SecondSidebar() {
//   const pathname = usePathname();

//   const renderContent = () => {
//     if (pathname === "/chat") return <ChatList />;
//     if (pathname === "/chat/requests") return <ChatRequestList />;
//     if (pathname === "/chat/privateChats") return <privateChatlist />;
//     return <div className="p-4 text-gray-500">No content</div>;
//   };

//   return (
//     <aside className="w-[280px] border-r overflow-y-auto bg-white dark:bg-gray-900">
//       {renderContent()}
//     </aside>
//   );
// }

"use client";
import { usePathname } from "next/navigation";
import ChatList from "./chatlist";
import ChatRequestList from "../chatrequestList/ChatrequestList";
import PrivateChatList from "../privateChatList/privateChatlist";

export default function SecondSidebar() {
  const pathname = usePathname();

  const getHeaderTitle = () => {
    if (pathname === "/chat") return "Chats";
    if (pathname === "/chat/requests") return "Requests";
    if (pathname === "/chat/private") return "Private Chats";
    return "Unknown";
  };

  const renderContent = () => {
    if (pathname === "/chat") return <ChatList />;
    if (pathname === "/chat/requests") return <ChatRequestList />;
    if (pathname === "/chat/private") return <PrivateChatList />;
    return <div className="p-4 text-gray-500">No content</div>;
  };

  return (
    <aside className="w-[280px] h-full border-r  border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold tracking-wide text-gray-800 dark:text-white">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">{renderContent()}</div>
    </aside>
  );
}
