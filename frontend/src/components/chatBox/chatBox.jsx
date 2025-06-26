"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ChatBox = () => (
  <div className="border rounded-lg p-4 flex flex-col gap-4 h-[60vh]">
    <div className="flex-1 overflow-y-auto space-y-2">
      <div className="text-left text-sm bg-gray-200 p-2 rounded max-w-[60%]">
        Hello there!
      </div>
      <div className="text-right text-sm bg-blue-500 text-white p-2 rounded max-w-[60%] ml-auto">
        Hi! What's up?
      </div>
    </div>
    <div className="flex gap-2">
      <Input placeholder="Type a message..." />
      <Button>Send</Button>
    </div>
  </div>
);

export default ChatBox;
