import React from "react";
import Sidebar from "./SideBar/SideBar";

export default function ChatMainLayout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
