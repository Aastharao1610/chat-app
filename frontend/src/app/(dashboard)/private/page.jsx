"use client";
import ChatMainLayout from "@/components/layout/chatMainLaoyut";
import ChatBox from "@/features/chat/chatBox/chatBox";

export default function privatePage() {
  return (
    <ChatMainLayout>
      <ChatBox />
    </ChatMainLayout>
  );
}
