// components/chat/ChatInput.jsx
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ChatInput = () => (
  <div className="border-t p-4 flex gap-2">
    <Input placeholder="Type a message..." />
    <Button>Send</Button>
  </div>
);

export default ChatInput;
