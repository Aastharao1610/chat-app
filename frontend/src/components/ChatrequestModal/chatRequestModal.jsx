// components/ChatRequestModal.jsx
"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const ChatRequestModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");

  const handleSend = () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }

    toast.success(`Request sent to ${email}`);
    onClose();
    setEmail("");
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
