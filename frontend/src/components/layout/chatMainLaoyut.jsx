"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import Sidebar from "../SideBar/SideBar"; 


export default function ChatMainLayout({ children }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);


  const isChatPage = pathname.startsWith("/chat");

  return (
    <div className="flex flex-col h-screen ">
     

      <div className="flex flex-1 overflow-hidden">
  
        <Sidebar />

       
        <main className="flex-1 overflow-y-auto bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
