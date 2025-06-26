// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import ChatRequestModal from "../../components/ChatrequestModal/chatRequestModal";
// import ChatBox from "../../components/chatBox/chatBox";

// const ChatPage = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [isAccepted, setIsAccepted] = useState(false); // control after request accepted
//   console.log("Rendering ChatPage"); // for /chat

//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-semibold">Your Chats</h2>
//         <Button onClick={() => setShowModal(true)}>New Chat</Button>
//       </div>

//       {!isAccepted ? (
//         <div className="text-gray-500 text-center mt-20">
//           Chat will appear here after a request is accepted.
//         </div>
//       ) : (
//         <ChatBox />
//       )}

//       <ChatRequestModal open={showModal} onClose={() => setShowModal(false)} />
//     </div>
//   );
// };

// export default ChatPage;

// app/chat/page.jsx
"use client";
import Sidebar from "../../components/SideBar/SideBar";
import ChatHeader from "../../components/chat/ChatHeader";
import ChatMessages from "../../components/chat/chatMessage";
import ChatInput from "../../components/ChatInput/ChatInput";

const ChatPage = () => {
  return (
    <div className="flex h-[calc(100vh-80px)]">
      <Sidebar />
      <div className="flex flex-col flex-1  bg-gray-50">
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatPage;
