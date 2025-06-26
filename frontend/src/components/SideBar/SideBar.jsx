// components/sidebar/Sidebar.jsx
"use client";
import { Button } from "../ui/button";

const Sidebar = () => {
  return (
    <aside className="bg-gray-100 w-64 h-full p-4 border-r hidden md:block">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="space-y-2 not-last:">
        <Button className="w-full" variant="ghost">
          Chats
        </Button>
        <Button className="w-full" variant="ghost">
          Requests
        </Button>
        <Button className="w-full" variant="ghost">
          Settings
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
