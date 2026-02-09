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
    console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND);

    const verifyEmail = async () => {
      try {
        // await axios.get(
        //   `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/verify-email?token=${token}`,
        // );
        // setStatus("success");
        // setMessage("✅ Email verified successfully! You can now log in.");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/verify-email?token=${token}`,
        );
        console.log(res, "response of email");
        if (res.data?.success) {
          setStatus("success");
          setMessage("✅ Email verified successfully! You can now log in.");
        } else {
          setStatus("error");
          setMessage(res.data?.error || "❌ Verification failed.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          err.response?.data?.error ||
            "❌ Verification failed or token expired.",
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Email Verification</h1>

        {status === "verifying" && (
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p>Verifying your email...</p>
          </div>
        )}

        {status !== "verifying" && (
          <div>
            <p
              className={`text-lg font-medium ${
                status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>

            {status === "success" && (
              <a
                href="/login"
                className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Go to Login
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
