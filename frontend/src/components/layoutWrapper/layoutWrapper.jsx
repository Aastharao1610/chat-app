// // // /src/components/layoutWrapper/LayoutWrapper.jsx
// "use client";
// import { usePathname } from "next/navigation";
// import Footer from "../Footer/Footer";
// import Sidebar from "../SideBar/SideBar";
// import { Provider } from "react-redux";
// import { store } from "@/store/store";
// import useLoadUser from "@/hooks/useLoader";

// const LayoutWrapper = ({ children }) => {
//   useLoadUser();
//   const path = usePathname();

//   const isAuthPage = path === "/login";
//   const isChatPage = path.startsWith("/chat");

//   return (
//     <Provider store={store}>
//       <div className="flex ">
//         <main className="flex-1">{children}</main>
//       </div>
//       {!isAuthPage && <Footer />}
//     </Provider>
//   );
// };

// export default LayoutWrapper;
"use client";
import { usePathname } from "next/navigation";
import Footer from "../Footer/Footer";
import Sidebar from "../SideBar/SideBar";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import useLoadUser from "@/hooks/useLoader";

const InnerLayout = ({ children }) => {
  useLoadUser(); // ✅ Now it's inside <Provider>, safe to call
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
      <InnerLayout>{children}</InnerLayout>
    </Provider>
  );
};

export default LayoutWrapper;
