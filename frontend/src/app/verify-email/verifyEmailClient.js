"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/verify-email?token=${token}`,
        );

        if (res.data?.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
        } else {
          setStatus("error");
          setMessage(res.data?.error || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.error || "Verification failed or token expired.",
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Email Verification</h1>

        {status === "verifying" && (
          <div className="flex flex-col items-center gap-3 text-gray-600 py-4">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p>Verifying your email...</p>
          </div>
        )}

        {status !== "verifying" && (
          <p
            className={`text-lg font-medium ${
              status === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
