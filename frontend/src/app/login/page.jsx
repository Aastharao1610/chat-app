// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// // import VerificationModal from "@/components/modal/verificationModal";
// import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import { Eye, EyeOff, Loader2 } from "lucide-react";
// import { useDispatch } from "react-redux";

// import { login as loginAction } from "@/store/authSlice";
// export default function LoginSignup() {
//   const [isSignup, setIsSignup] = useState(false);
//   // const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const router = useRouter();
//   const dispatch = useDispatch();

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isValid },
//     reset,
//   } = useForm({ mode: "onChange" });

//   const onSubmit = async (data) => {
//     if (loading) return;
//     setLoading(true);

//     try {
//       const endPoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
//       // Clean up data for login
//       const payload = isSignup
//         ? data
//         : { email: data.email, password: data.password };
//       const res = await axios.post(endPoint, payload, {
//         withCredentials: true,
//       });

//       if (isSignup) {
//         toast.success("User created successfully!");
//         setIsSignup(false);
//         reset();
//       } else {
//         dispatch(
//           loginAction({
//             user: res.data.user,
//             token: res.data.accessToken,
//           }),
//         );
//         toast.success("Login successful!");
//         router.push("/chat");
//       }
//     } catch (err) {
//       const status = err?.response?.status;
//       const message =
//         err?.response?.data?.message || err?.response?.data?.error;

//       if (status === 401) toast.error("Invalid email or password");
//       else if (status === 409) toast.error("User already exists");
//       else toast.error(message || "An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg p-6 md:p-10">
//         <div className="flex justify-center mb-6">
//           <button
//             type="button"
//             className={`w-1/2 py-2.5 rounded-l-lg font-semibold cursor-pointer transition-colors text-sm md:text-base ${
//               !isSignup
//                 ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
//                 : "bg-gray-200 text-gray-600"
//             }`}
//             onClick={() => {
//               setIsSignup(false);
//               reset();
//             }}
//           >
//             Login
//           </button>
//           <button
//             type="button"
//             className={`w-1/2 py-2.5 rounded-r-lg cursor-pointer font-semibold transition-colors text-sm md:text-base ${
//               isSignup
//                 ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
//                 : "bg-gray-200 text-gray-600"
//             }`}
//             onClick={() => {
//               setIsSignup(true);
//               reset();
//             }}
//           >
//             Signup
//           </button>
//         </div>

//         <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
//           {isSignup ? "Signup Form" : "Login Form"}
//         </h2>

//         <form
//           className="space-y-4 md:space-y-5"
//           onSubmit={handleSubmit(onSubmit)}
//         >
//           {isSignup && (
//             <div>
//               <input
//                 type="text"
//                 placeholder="Full Name"
//                 className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
//                 {...register("name", {
//                   required: "Full Name is required",
//                   minLength: { value: 2, message: "Name too short" },
//                 })}
//               />
//               {errors.name && (
//                 <p className="text-xs md:text-sm text-red-600 mt-1">
//                   {errors.name.message}
//                 </p>
//               )}
//             </div>
//           )}

//           <div>
//             <input
//               type="email"
//               placeholder="Email Address"
//               className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
//               {...register("email", {
//                 required: "Email is required",
//                 pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
//               })}
//             />
//             {errors.email && (
//               <p className="text-xs md:text-sm text-red-600 mt-1">
//                 {errors.email.message}
//               </p>
//             )}
//           </div>

//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               placeholder="Password"
//               className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 text-sm md:text-base"
//               {...register("password", {
//                 required: "Password is required",
//                 minLength: { value: 6, message: "Minimum 6 characters" },
//               })}
//             />
//             <div
//               className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
//               onClick={() => setShowPassword((prev) => !prev)}
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </div>
//             {errors.password && (
//               <p className="text-xs md:text-sm text-red-600 mt-1">
//                 {errors.password.message}
//               </p>
//             )}
//           </div>

//           {/* {!isSignup && (
//             <div className="text-right cursor-pointer text-xs md:text-sm text-blue-500 hover:underline">
//               Forgot password?
//             </div>
//           )} */}

//           <button
//             type="submit"
//             disabled={loading || !isValid}
//             className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
//               loading || !isValid
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.99] shadow-md shadow-blue-100"
//             }`}
//           >
//             {loading && <Loader2 className="animate-spin" size={20} />}
//             {loading
//               ? isSignup
//                 ? "Creating Account..."
//                 : "Signing In..."
//               : isSignup
//                 ? "Sign Up"
//                 : "LogIn"}
//           </button>
//         </form>
//       </div>

//       {/* <VerificationModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       /> */}
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { login as loginAction } from "@/store/authSlice";

export default function LoginSignup() {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";

      const payload = isSignup
        ? data
        : { email: data.email, password: data.password };

      const res = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      if (isSignup) {
        toast.success("Account created! Please login.");
        setIsSignup(false);
        reset();
      } else {
        dispatch(
          loginAction({
            user: res.data.user,
            token: res.data.accessToken,
          }),
        );
        toast.success("Welcome back!");
        router.push("/chat");
      }
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message || err?.response?.data?.error;

      if (status === 401) toast.error("Invalid email or password");
      else if (status === 409) toast.error("User already exists");
      else toast.error(message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-10 border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button
            type="button"
            className={`flex-1 py-2 cursor-pointer rounded-lg font-medium transition-all duration-200 ${
              !isSignup
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-500 hover:text-gray-700"
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
            className={`flex-1 py-2 cursor-pointer rounded-lg font-medium transition-all duration-200 ${
              isSignup
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setIsSignup(true);
              reset();
            }}
          >
            Signup
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {isSignup ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {isSignup
              ? "Join our community today"
              : "Enter your credentials to access your chats"}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {isSignup && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Full Name
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? "border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:ring-blue-100"
                }`}
                {...register("name", {
                  required: "Full Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:ring-blue-100"
              }`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Please enter a valid email",
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all pr-10 ${
                  errors.password
                    ? "border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:ring-blue-100"
                }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 cursor-pointer flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isValid}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              loading || !isValid
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer active:transform active:scale-[0.99] shadow-md shadow-blue-100"
            }`}
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading
              ? isSignup
                ? "Creating Account..."
                : "Signing In..."
              : isSignup
                ? "Sign Up"
                : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
