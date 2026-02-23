"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
// import VerificationModal from "@/components/modal/verificationModal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";

import { login as loginAction } from "@/store/authSlice";
console.log("Target URL:", `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/login`);
export default function LoginSignup() {
  console.log("Target URL:", `/auth/login`);
  const [isSignup, setIsSignup] = useState(false);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    if (loading) return;

    try {
      setLoading(true);

      if (isSignup) {
        const res = await axios.post(`/api/auth/signup`, data);

        // if (res.data?.message === "User already exists") {
        //   toast.error("User already exists. Redirecting to login...");
        //   setIsSignup(false);
        if (res.status === 201) {
          toast.success("User created successfully!");
          setIsSignup(false);
          reset();
        }
      } else {
        const res = await axios.post(
          `/api/auth/login`,

          {
            email: data.email,
            password: data.password,
          },
          { withCredentials: true },
        );

        console.log(res);

        if (res.status === 200) {
          dispatch(
            loginAction({
              user: res.data.user,
              token: res.data.accessToken,
            }),
          );
          toast.success("Login successful!");
          router.push("/chat");
        }
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Something went wrong.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg p-6 md:p-10">
        <div className="flex justify-center mb-6">
          <button
            type="button"
            className={`w-1/2 py-2.5 rounded-l-lg font-semibold cursor-pointer transition-colors text-sm md:text-base ${
              !isSignup
                ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => {
              setIsSignup(false);
              reset();
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`w-1/2 py-2.5 rounded-r-lg cursor-pointer font-semibold transition-colors text-sm md:text-base ${
              isSignup
                ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => {
              setIsSignup(true);
              reset();
            }}
          >
            Signup
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          {isSignup ? "Signup Form" : "Login Form"}
        </h2>

        <form
          className="space-y-4 md:space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          {isSignup && (
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                {...register("name", {
                  required: "Full Name is required",
                  minLength: { value: 2, message: "Name too short" },
                })}
              />
              {errors.name && (
                <p className="text-xs md:text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
            />
            {errors.email && (
              <p className="text-xs md:text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 text-sm md:text-base"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            {errors.password && (
              <p className="text-xs md:text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {!isSignup && (
            <div className="text-right cursor-pointer text-xs md:text-sm text-blue-500 hover:underline">
              Forgot password?
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className={`w-full py-3 rounded-md font-semibold text-sm md:text-base transition-all ${
              loading || !isValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-400 cursor-pointer text-white hover:opacity-90 active:scale-[0.98]"
            }`}
          >
            {loading
              ? isSignup
                ? "Signing up..."
                : "Logging in..."
              : isSignup
                ? "Signup"
                : "Login"}
          </button>
        </form>
      </div>

      {/* <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}
    </div>
  );
}
