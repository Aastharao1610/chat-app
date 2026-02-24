"use client";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sectionMap = {
  "/chat": "Chats",
  "/requests": "Requests",
  "/private": "Private Chats",
  "/groups": "Groups",
};

const ChatSectionHeader = ({ onActionClick }) => {
  const pathname = usePathname();
  const router = useRouter();

  const title = sectionMap[pathname] || "Chat";

  const showBack = pathname !== "/chat";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-black">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      {pathname === "/chat" && (
        <Button onClick={onActionClick} size="sm">
          New Chat
        </Button>
      )}

      {pathname === "/chat/groups" && (
        <Button onClick={onActionClick} size="sm">
          Create Group
        </Button>
      )}
    </div>
  );
};

export default ChatSectionHeader;
