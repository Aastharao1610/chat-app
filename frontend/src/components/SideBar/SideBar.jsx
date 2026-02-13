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
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { logout } from "@/store/authSlice";

const navItems = [
  {
    label: "Chats",
    icon: MessageCircle,
    path: "/chat",
  },
  {
    label: "Requests",
    icon: UserPlus,
    path: "/chat/requests",
  },
  {
    label: "Private Chats",
    icon: Lock,
    path: "/chat/private",
  },
  {
    label: "Groups",
    icon: Users,
    path: "/chat/groups",
  },
  {
    label: "Setting",
    icon: Settings,
    path: "/chat/setting",
  },
  // {
  //   label: "Profile",
  //   icon: profile,
  //   path: "/chat/profile",
  // },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      dispatch(logout());
      toast.success("Logged out successfully!", { autoClose: 2000 });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      toast.error("Logout failed! Try again.");
    }
  };

  return (
    <aside className="bg-[#111827]  text-white text-black w-12 h-full py-6 border-r hidden md:flex flex-col justify-between">
      <div className="space-y-3 ">
        <h2 className="text-xl  font-bold mb-6 tracking-wide text-gray-200">
          {/* Chat App */}
        </h2>
        <div className="pt-4 border-t border-gray-700 px-0"></div>
        {navItems.map(({ icon: Icon, path }) => (
          <Button
            // key={label}
            variant="ghost"
            className={cn(
              " flex items-center cursor-pointer justify-start gap-4 text-left text-lg py-3 px-4 rounded-lg hover:bg-gray-800 hover:text-white transition",
              pathname === path && "bg-gray-800 text-white font-semibold",
            )}
            onClick={() => router.push(path)}
          >
            <Icon size={22} />
            {/* {label} */}
          </Button>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className=" flex items-center justify-start gap-4 text-left text-lg py-3 px-4 rounded-lg hover:bg-red-100 hover:text-red-600 transition text-red-400"
          onClick={handleLogout}
        >
          <LogOut size={22} />
          {/* Logout */}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

// "use client";
// import { usePathname, useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import {
//   MessageCircle,
//   UserPlus,
//   Lock,
//   Users,
//   LogOut,
//   Settings,
// } from "lucide-react";
// import { Button } from "../ui/button";
// import { useDispatch } from "react-redux";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { logout } from "@/store/authSlice";

// const navItems = [
//   { label: "Chats", icon: MessageCircle, path: "/chat" },
//   { label: "Requests", icon: UserPlus, path: "/chat/requests" },
//   { label: "Private", icon: Lock, path: "/chat/private" },
//   { label: "Groups", icon: Users, path: "/chat/groups" },
//   // { label: "Setting", icon: Settings, path: "/chat/setting" },
// ];

// const Sidebar = () => {
//   const pathname = usePathname();
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/logout`,
//         {},
//         { withCredentials: true },
//       );
//       dispatch(logout());
//       toast.success("Logged out successfully!");
//       router.push("/login");
//     } catch (err) {
//       toast.error("Logout failed!");
//     }
//   };

//   return (
//     <>
//       {/* DESKTOP SIDEBAR (Left side) */}
//       <aside className="hidden md:flex bg-[#111827] text-white w-16 h-full py-6 border-r border-gray-800 flex-col justify-between items-center">
//         <div className="space-y-4 w-full flex flex-col items-center">
//           <div className="mb-4 text-blue-500">
//             <MessageCircle size={28} fill="currentColor" />
//           </div>
//           {navItems.map(({ icon: Icon, path, label }) => (
//             <button
//               key={path}
//               title={label}
//               className={cn(
//                 "p-3 rounded-xl transition-all duration-200 hover:bg-gray-800",
//                 pathname === path
//                   ? "bg-gray-800 text-blue-400"
//                   : "text-gray-400",
//               )}
//               onClick={() => router.push(path)}
//             >
//               <Icon size={24} />
//             </button>
//           ))}
//         </div>

//         <button
//           className="p-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"
//           onClick={handleLogout}
//         >
//           <LogOut size={24} />
//         </button>
//       </aside>

//       {/* MOBILE BOTTOM NAVIGATION (WhatsApp Style) */}
//       {/* Note: We hide this when a user is likely looking at a specific chat's messages */}
//       <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-gray-800 px-2 py-1 flex justify-around items-center z-50">
//         {navItems.map(({ icon: Icon, path, label }) => {
//           const isActive = pathname === path;
//           return (
//             <button
//               key={path}
//               className="flex flex-col items-center justify-center py-2 px-1 min-w-[64px]"
//               onClick={() => router.push(path)}
//             >
//               <div
//                 className={cn(
//                   "p-1 px-4 rounded-full transition-colors",
//                   isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400",
//                 )}
//               >
//                 <Icon size={24} />
//               </div>
//               <span
//                 className={cn(
//                   "text-[10px] mt-1",
//                   isActive ? "text-blue-400 font-medium" : "text-gray-400",
//                 )}
//               >
//                 {label}
//               </span>
//             </button>
//           );
//         })}
//         {/* Logout button for mobile (optional, or put in Settings) */}
//         <button
//           className="flex flex-col items-center py-2 text-gray-400"
//           onClick={handleLogout}
//         >
//           <LogOut size={24} />
//           <span className="text-[10px] mt-1">Exit</span>
//         </button>
//       </nav>
//     </>
//   );
// };

// export default Sidebar;
