"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import Sidebar from "../SideBar/SideBar"; // Optional: show only if needed
// import Header from "../Header/Header";   // Optional

export default function ChatMainLayout({ children }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  // Optional: show sidebar or header conditionally
  const isChatPage = pathname.startsWith("/chat");

  return (
    <div className="flex flex-col h-screen">
      {/* Optional Header */}
      {/* {isChatPage && <Header />} */}

      <div className="flex flex-1 overflow-hidden">
        {/* Optional Sidebar */}
        <Sidebar />

        {/* Main Chat Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
