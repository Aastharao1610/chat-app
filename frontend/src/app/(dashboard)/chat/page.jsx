"use client";
import ChatMainLayout from "@/components/layout/chatMainLaoyut";
import ChatBox from "@/features/chat/chatBox/chatBox";

export default function ChatPage() {
  return (
    <ChatMainLayout>
      <ChatBox />
    </ChatMainLayout>
  );
}

// import SecondSidebar from "@/features/chat/chatBox/secondSideBar";
// import ChatMessages from "@/features/chat/ChatMessage/ChatMessage";

// export default function ChatPage() {
//   return (
//     <>
//       <div className="w-[350px] border-r border-gray-800">
//         <SecondSidebar />
//       </div>
//       <div className="flex-1">
//         <ChatMessages />
//       </div>
//     </>
//   );
// }
