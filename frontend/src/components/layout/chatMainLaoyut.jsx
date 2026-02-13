import React from "react";
import Sidebar from "../SideBar/SideBar";

export default function ChatMainLayout({ children }) {
  return (
    <div className="flex flex-col h-screen ">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100">{children}</main>
      </div>
    </div>
  );
}

// export default function ChatMainLayout({ children }) {
//   return (
//     <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-neutral-950">
//       <Sidebar /> {/* Hidden on mobile via its own 'hidden md:flex' */}
//       <main className="flex-1 h-full overflow-hidden relative">{children}</main>
//     </div>
//   );
// }
