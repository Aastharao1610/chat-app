// // components/sidebar/Sidebar.jsx
// "use client";
// import { usePathname, useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { MessageCircle, UserPlus, Lock, Users, LogOut } from "lucide-react";
// import { Button } from "../ui/button";
// import { useDispatch } from "react-redux";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { logout } from "@/store/authSlice";

// const navItems = [
//   {
//     label: "Chats",
//     icon: MessageCircle,
//     path: "/chat",
//   },
//   {
//     label: "Requests",
//     icon: UserPlus,
//     path: "/chat/requests",
//   },
//   {
//     label: "Private Chats",
//     icon: Lock,
//     path: "/chat/private",
//   },
//   {
//     label: "Groups",
//     icon: Users,
//     path: "/chat/groups",
//   },
// ];

// const Sidebar = () => {
//   const pathname = usePathname();
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         "http://localhost:5000/api/auth/logout",
//         {},
//         { withCredentials: true }
//       );
//       dispatch(logout());
//       toast.success("Logged out successfully!", { autoClose: 2000 });
//       setTimeout(() => {
//         router.push("/login");
//       }, 2000);
//     } catch (err) {
//       toast.error("Logout failed! Try again.");
//     }
//   };

//   return (
//     <aside className="bg-[#111827] text-white w-64 h-full p-5 border-r hidden md:flex flex-col justify-between">
//       <div className="space-y-1">
//         {navItems.map(({ label, icon: Icon, path }) => (
//           <Button
//             key={label}
//             variant="ghost"
//             className={cn(
//               "w-full flex items-center justify-start gap-3 text-left text-sm py-2 px-3 rounded-lg hover:bg-gray-800 hover:text-white transition",
//               pathname === path && "bg-gray-800 text-white font-semibold"
//             )}
//             onClick={() => router.push(path)}
//           >
//             <Icon size={18} />
//             {label}
//           </Button>
//         ))}
//       </div>

//       <div>
//         <Button
//           variant="ghost"
//           className="w-full flex items-center justify-start gap-3 text-left text-sm py-2 px-3 rounded-lg hover:bg-red-100 hover:text-red-600 transition text-red-400"
//           onClick={handleLogout}
//         >
//           <LogOut size={18} />
//           Logout
//         </Button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

// components/sidebar/Sidebar.jsx
"use client";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageCircle, UserPlus, Lock, Users, LogOut } from "lucide-react";
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
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
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
    <aside className="bg-[#111827] text-white w-72 h-full p-6 border-r hidden md:flex flex-col justify-between">
      <div className="space-y-3">
        <h2 className="text-xl font-bold mb-6 tracking-wide text-gray-200">
          Weave Chat
        </h2>
        {navItems.map(({ label, icon: Icon, path }) => (
          <Button
            key={label}
            variant="ghost"
            className={cn(
              "w-full flex items-center justify-start gap-4 text-left text-lg py-3 px-4 rounded-lg hover:bg-gray-800 hover:text-white transition",
              pathname === path && "bg-gray-800 text-white font-semibold"
            )}
            onClick={() => router.push(path)}
          >
            <Icon size={22} />
            {label}
          </Button>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-start gap-4 text-left text-lg py-3 px-4 rounded-lg hover:bg-red-100 hover:text-red-600 transition text-red-400"
          onClick={handleLogout}
        >
          <LogOut size={22} />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
