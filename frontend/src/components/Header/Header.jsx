// components/Header.jsx
"use client";
import { LogOut } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-black text-white flex justify-between items-center p-4">
      <h1 className="text-xl font-bold">Chat</h1>
      <button className="hover:text-red-500 transition">
        <LogOut size={20} />
      </button>
    </header>
  );
};

export default Header;
