// components/ChatRequestModal.jsx
"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";
import { getSocket } from "@/lib/socket";

const ChatRequestModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");

  const { user: currentUser } = useSelector((state) => state.auth); // ✅ ensure inside component
  const handleSend = async () => {
    console.log("📤 Sending request...");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/request/send",
        {
          senderId: currentUser.id,
          receiverEmail: email,
        },
        {
          withCredentials: true,
        }
      );

      console.log("✅ Response received:", response); // This should now print

      const newRequest = response.data.request;
      console.log("📦 New chat request:", newRequest);

      const socket = getSocket();
      socket?.emit("new-chat-request", newRequest); // ✅ Send full data

      toast.success(`Request sent to ${email}`);
      onClose();
      setEmail("");
    } catch (err) {
      console.error("❌ Error sending request:", err);
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Enter user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleSend}>Send Request</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatRequestModal;
