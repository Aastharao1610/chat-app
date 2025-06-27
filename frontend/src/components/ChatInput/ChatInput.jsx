"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { initSocket } from "@/lib/socket";
import axios from "axios";

// const ChatInput = ({ currentUser, selectedUser, currentChatId }) => {
//   const socket = initSocket();
//   const [input, setInput] = useState("");

//   // const handleSend = async () => {
//   //   if (!input.trim()) return;

//   //   const messageData = {
//   //     text: input,
//   //     senderId: currentUser.id,
//   //     receiverId: selectedUser.id, // Pass from props or context
//   //     chatId: currentChatId, // optional
//   //   };

//   //   await axios.post("http://localhost:5000/api/messages", messageData);

//   //   socket.emit("send-message", messageData);

//   //   setInput("");
//   // };

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     if (!currentUser || !selectedUser) {
//       console.warn("Missing user or selected user");
//       return;
//     }

//     const messageData = {
//       text: input,
//       senderId: currentUser.id,
//       receiverId: selectedUser.id,
//       chatId: currentChatId,
//     };

//     try {
//       await axios.post("http://localhost:5000/api/messages", messageData);
//       socket.emit("send-message", messageData);
//       setInput("");
//     } catch (err) {
//       console.error("Failed to send message:", err);
//     }
//   };

//   return (
//     <div className="flex gap-2">
//       <Input
//         placeholder="Type a message..."
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && handleSend()}
//       />
//       <Button onClick={handleSend}>Send</Button>
//     </div>
//   );
// };

// export default ChatInput;

// "use client";
// import { useEffect, useState } from "react";
// import { initSocket } from "@/lib/socket";
const ChatInput = ({ currentUser, selectedUser, currentChatId }) => {
  const socket = initSocket();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!currentUser || !selectedUser) {
      console.warn("Missing user or selected user");
      return;
    }

    const messageData = {
      text: input,
      senderId: currentUser.id,
      receiverId: currentUser.id === 3 ? 4 : 3,
      // chatId: currentChatId,
    };
    console.log("senderId:", currentUser?.id, "receiverId:", selectedUser?.id);

    try {
      await axios.post("http://localhost:5000/api/messages", messageData);
      socket.emit("send-message", messageData);
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
};

export default ChatInput;
