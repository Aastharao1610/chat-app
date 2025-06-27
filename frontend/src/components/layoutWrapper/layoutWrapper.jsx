"use client";
import { usePathname } from "next/navigation";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Provider } from "react-redux";
import { store } from "../../store/store";
// import { ThemeProvider } from "next-themes";

const LayoutWrapper = ({ children }) => {
  const path = usePathname();
  const isAuthPage = path === "/login";

  return (
    <Provider store={store}>
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
      {!isAuthPage && <Header />}
      <main className="min-h-[calc(100vh-120px)]">{children}</main>
      {!isAuthPage && <Footer />}
      {/* </ThemeProvider> */}
    </Provider>
  );
};

export default LayoutWrapper;
