// /src/components/layoutWrapper/LayoutWrapper.jsx
"use client";
import { usePathname } from "next/navigation";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Sidebar from "../SideBar/SideBar";
import { Provider } from "react-redux";
import { store } from "@/store/store";

const LayoutWrapper = ({ children }) => {
  const path = usePathname();

  const isAuthPage = path === "/login";
  const isChatPage = path.startsWith("/chat");

  return (
    <Provider store={store}>
      {!isAuthPage && <Header />}
      <div className="flex  h-[calc(100vh-80px)]">
        {isChatPage && <Sidebar />}
        <main className="flex-1">{children}</main>
      </div>
      {!isAuthPage && <Footer />}
    </Provider>
  );
};

export default LayoutWrapper;
