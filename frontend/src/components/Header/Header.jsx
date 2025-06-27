"use client";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, User2, ChevronDown, Settings } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { logout } from "@/store/authSlice";
import { fetchUser } from "@/lib/fetchUser";
import ThemeToggle from "../themetoggle/ThemeToggle";

const Header = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  console.log(user);

  useEffect(() => {
    if (!user) {
      fetchUser(dispatch);
    }
  }, [user, dispatch]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";
  console.log(initials, "initals");

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      dispatch(logout());
      toast.success("Logout successful!", { autoClose: 2000 });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      toast.error("Logout failed! Try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="w-full text-white bg-black flex justify-between items-center px-6 py-4 shadow-md">
      <h1 className="text-xl font-bold tracking-wide"> Chat</h1>

      <div className="relative flex justify-between gap-6" ref={dropdownRef}>
        {/* <ThemeToggle /> */}
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center space-x-2 bg-white text-black px-3 py-2 rounded-full shadow hover:shadow-lg transition"
        >
          <span className="bg-gray-50 cursor-pointer text-black rounded-full w-9 h-9 flex items-center justify-center font-semibold">
            {initials}
          </span>
          <ChevronDown className="cursor-pointer" size={18} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-md overflow-hidden z-50">
            <div className="px-4 cursor-pointer py-3 border-b text-sm hover:bg-blue-50 flex items-center gap-2">
              <User2 size={18} className="text-blue-500" />
              <span className="truncate">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full cursor-pointer border-b  px-4 py-3 text-left text-red-600 hover:bg-red-50 text-sm flex items-center gap-2"
            >
              <LogOut className="cursor-pointer" size={18} />
              Logout
            </button>
            <div className="px-4 py-3 border-b text-sm hover:bg-gray-50 flex items-center gap-2">
              <Settings size={18} className="" />
              <button>Setting</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
