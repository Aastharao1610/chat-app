"use client";
import { usePathname, useRouter } from "next/navigation";
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
import { useState } from "react";
import { Loader2 } from "lucide-react";

const navItems = [
  { label: "Chats", icon: MessageCircle, path: "/chat" },
  { label: "Requests", icon: UserPlus, path: "/requests" },
  { label: "Private", icon: Lock, path: "/private" },
  { label: "Groups", icon: Users, path: "/groups" },
  // { label: "Settings", icon: Settings, path: "/chat/setting" },
];

const Sidebar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post(`api/auth/logout`, {}, { withCredentials: true });
      dispatch(logout());
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed!");
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="hidden md:block w-16 h-full flex-shrink-0 relative">
        <aside
          className={cn(
            "absolute top-0 left-0 h-full bg-[#111827] text-white border-r border-gray-800 transition-[width] duration-300 ease-in-out z-[60] flex flex-col group overflow-hidden shadow-2xl",
            "w-16 hover:w-64",
          )}
        >
          {/* Navigation Items */}
          <div className="flex flex-col flex-1 py-6">
            <div className="space-y-4 w-full">
              {navItems.map(({ icon: Icon, path, label }) => {
                const isActive = pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => router.push(path)}
                    className={cn(
                      "flex items-center h-12 w-full transition-all duration-200 relative group/btn",
                      isActive
                        ? "text-blue-400"
                        : "text-gray-400 hover:text-gray-200",
                    )}
                  >
                    {/* ICON CONTAINER: Fixed at 64px width. 
                        This ensures the icon is ALWAYS centered in the collapsed view.
                    */}
                    <div className="w-16 h-full flex items-center justify-center flex-shrink-0">
                      <div
                        className={cn(
                          "p-2 rounded-xl transition-colors",
                          isActive
                            ? "bg-blue-600/20"
                            : "group-hover/btn:bg-gray-800",
                        )}
                      >
                        <Icon size={24} />
                      </div>
                    </div>

                    {/* LABEL: Revealed only on sidebar hover */}
                    <span
                      className={cn(
                        "font-medium whitespace-nowrap transition-all duration-300 ease-in-out",
                        "opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0",
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout Section */}
          <div className="p-2 border-t border-gray-800 mb-4">
            <button
              className="flex items-center cursor-pointer h-12 w-full text-red-400 transition-all group/logout"
              onClick={handleLogout}
            >
              <div className="w-12 h-full flex items-center justify-center flex-shrink-0 ml-1">
                {isLoggingOut ? (
                  <Loader2 size={22} className="animate-spin text-gray-400" />
                ) : (
                  <LogOut size={22} />
                )}
              </div>
              <span
                className={cn(
                  "ml-3 font-medium whitespace-nowrap transition-all duration-300",
                  "opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0",
                )}
              >
                {isLoggingOut ? "Exiting..." : "Logout"}
              </span>
            </button>
          </div>
        </aside>
      </div>
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
