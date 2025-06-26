"use client";
import { LogOut } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      // Redirect to login page after logout
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <header className="w-full bg-black text-white flex justify-between items-center p-4">
      <h1 className="text-xl font-bold">Chat</h1>
      <button
        onClick={handleLogout}
        className="hover:text-red-500 transition"
        aria-label="Logout"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
};

export default Header;
