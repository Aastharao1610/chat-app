import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

import LayoutWrapper from "@/components/layoutWrapper/layoutWrapper";

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
        <LayoutWrapper>
          <main className="">{children}</main>
        </LayoutWrapper>
      </body>
    </html>
  );
}
