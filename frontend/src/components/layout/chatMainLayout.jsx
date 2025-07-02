import Sidebar from "../SideBar/SideBar";

export default function ChatMainLayout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 h-full">{children}</div>
    </div>
  );
}
