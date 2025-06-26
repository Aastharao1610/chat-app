"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-email?token=${token}`
        );
        setStatus("success");
        setMessage("✅ Email verified successfully. You can now log in.");
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.error ||
            "❌ Verification failed or token expired."
        );
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
            <p>Verifying your email...</p>
          </div>
        )}

        {status !== "verifying" && (
          <p
            className={`mt-4 ${
              status === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}

            {status === "success" && (
              <a
                href="/login"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Login
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
