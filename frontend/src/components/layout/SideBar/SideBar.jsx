"use client";
import { usePathname, useRouter, useState } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  UserPlus,
  Lock,
  Users,
  LogOut,
  Settings,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { logout } from "@/store/authSlice";

const navItems = [
  { label: "Chats", icon: MessageCircle, path: "/chat" },
  { label: "Requests", icon: UserPlus, path: "/chat/requests" },
  { label: "Private", icon: Lock, path: "/chat/private" },
  { label: "Groups", icon: Users, path: "/chat/groups" },
  // { label: "Settings", icon: Settings, path: "/chat/setting" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  const handleLogout = async () => {
    try {
      await axios.post(`api/auth/logout`, {}, { withCredentials: true });
      dispatch(logout());
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed!");
    }
  };

  return (
    <>
      <aside className="hidden md:flex bg-[#111827] text-white w-16 h-full py-6 border-r border-gray-800 flex-col justify-between items-center z-50">
        <div className="space-y-4 w-full flex flex-col items-center">
          <div className="mb-4 text-blue-500">
            {/* <MessageCircle size={28} fill="currentColor" /> */}
          </div>
          {navItems.map(({ icon: Icon, path, label }) => (
            <button
              key={path}
              title={label}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 hover:bg-gray-800",
                pathname === path
                  ? "bg-gray-800 text-blue-400 shadow-lg"
                  : "text-gray-400",
              )}
              onClick={() => router.push(path)}
            >
              <Icon size={24} />
            </button>
          ))}
        </div>

        <button
          className="p-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={24} />
        </button>
      </aside>

      {/* <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-gray-800 px-2 py-1 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.3)] ${selectedChat ? "chat-active-view" : ""}`}
      > */}
      <nav
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-gray-800 px-2 py-1 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.3)] transition-all duration-300",
          // HIDE logic: if selectedChat is active and we are in the chat section, move it down
          selectedChat && pathname.startsWith("/chat")
            ? "translate-y-full opacity-100 pointer-events-none"
            : "translate-y-0 opacity-100",
        )}
      >
        {navItems.map(({ icon: Icon, path, label }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              className="flex flex-col items-center justify-center py-2 px-1 min-w-[60px] active:scale-90 transition-transform"
              onClick={() => router.push(path)}
            >
              <div
                className={cn(
                  "p-1.5 px-4 rounded-full transition-colors",
                  isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400",
                )}
              >
                <Icon size={22} />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium tracking-tight",
                  isActive ? "text-blue-400" : "text-gray-400",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* Small Exit button for mobile */}
        <button
          className="flex flex-col items-center py-2 px-1 min-w-[60px] text-red-400 active:scale-90 transition-transform"
          onClick={handleLogout}
        >
          <div className="p-1.5 px-4">
            <LogOut size={22} />
          </div>
          <span className="text-[10px] mt-1">Exit</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
