"use client";
import { usePathname } from "next/navigation";
import Footer from "../Footer/Footer";
import Sidebar from "../SideBar/SideBar";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import useLoadUser from "@/hooks/useLoader";
import SocketInitializer from "../socketInitializer/socketInitializer";

const InnerLayout = ({ children }) => {
  useLoadUser(); 
  const path = usePathname();
  const isAuthPage = path === "/login";

  return (
    <div className="flex">
      <main className="flex-1">{children}</main>
      {/* {!isAuthPage && <Footer />} */}
    </div>
  );
};

const LayoutWrapper = ({ children }) => {
  return (
    <Provider store={store}>
      <SocketInitializer />
      <InnerLayout>{children}</InnerLayout>
    </Provider>
  );
};

export default LayoutWrapper;
