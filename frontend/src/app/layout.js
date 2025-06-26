// app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { ToastContainer, toast } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: " Chat",
  description: "One-on-one chat system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer />
        <Header />
        <main className="min-h-[calc(100vh-120px)] ">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
