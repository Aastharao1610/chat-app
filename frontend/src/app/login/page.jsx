// "use client";
// import { useState } from "react";

// export default function LoginSignup() {
//   const [isSignup, setIsSignup] = useState(false);

//   const toggleForm = () => setIsSignup((prev) => !prev);

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-10">
//         {/* Toggle Buttons */}
//         <div className="flex justify-center mb-6">
//           <button
//             className={`w-1/2 py-2 rounded-l-lg font-semibold transition-colors ${
//               !isSignup
//                 ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
//                 : "bg-gray-200 text-gray-600"
//             }`}
//             onClick={() => setIsSignup(false)}
//           >
//             Login
//           </button>
//           <button
//             className={`w-1/2 py-2 rounded-r-lg font-semibold transition-colors ${
//               isSignup
//                 ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
//                 : "bg-gray-200 text-gray-600"
//             }`}
//             onClick={() => setIsSignup(true)}
//           >
//             Signup
//           </button>
//         </div>

//         {/* Form Title */}
//         <h2 className="text-3xl font-bold text-center mb-8">
//           {isSignup ? "Signup Form" : "Login Form"}
//         </h2>

//         {/* Form */}
//         <form className="space-y-5">
//           {isSignup && (
//             <input
//               type="text"
//               placeholder="Full Name"
//               className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           )}
//           <input
//             type="email"
//             placeholder="Email Address"
//             className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />

//           {!isSignup && (
//             <div className="text-right text-sm text-blue-500 hover:underline cursor-pointer">
//               Forgot password?
//             </div>
//           )}

//           <button
//             type="submit"
//             className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-md font-semibold hover:opacity-90"
//           >
//             {isSignup ? "Signup" : "Login"}
//           </button>

//           {/* {!isSignup && (
//             <p className="text-sm text-center text-gray-500">
//               Not a member?{" "}
//               <span
//                 className="text-blue-600 hover:underline cursor-pointer"
//                 onClick={toggleForm}
//               >
//                 Signup now
//               </span>
//             </p>
//           )} */}
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginSignup() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleForm = () => setIsSignup((prev) => !prev);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!form.email || !form.password || (isSignup && !form.name)) return;

  //   try {
  //     setLoading(true);

  //     if (isSignup) {
  //       const res = await axios.post(
  //         "http://localhost:5000/api/auth/signup",
  //         form
  //       );

  //       if (res.data?.message === "User already exists") {
  //         alert("User already exists. Redirecting to login...");
  //         setIsSignup(false);
  //       } else {
  //         alert("Verification email sent! Check your inbox.");
  //       }
  //     } else {

  //       console.log("Logging in...", form);
  //     }
  //   } catch (err) {
  //     console.error("Signup error:", err.response?.data || err.message);
  //     alert(err.response?.data?.error || "Signup failed.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || (isSignup && !form.name)) return;

    try {
      setLoading(true);

      if (isSignup) {
        const res = await axios.post(
          "http://localhost:5000/api/auth/signup",
          form
        );

        if (res.data?.message === "User already exists") {
          alert("User already exists. Redirecting to login...");
          setIsSignup(false);
        } else {
          alert("Verification email sent! Check your inbox.");
        }
      } else {
        // 🔐 LOGIN FLOW
        console.log("Attempting login with", form.email, form.password);
        const res = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email: form.email,
            password: form.password,
          },

          {
            withCredentials: true, // ✅ Important to receive cookies
          }
        );

        if (res.status === 200) {
          alert("Login successful!");
          router.push("/chat"); // ✅ Redirect to /chat
        }
      }
    } catch (err) {
      console.error("Login/Signup error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-10">
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <button
            className={`w-1/2 py-2 rounded-l-lg font-semibold transition-colors ${
              !isSignup
                ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => setIsSignup(false)}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-2 rounded-r-lg font-semibold transition-colors ${
              isSignup
                ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => setIsSignup(true)}
          >
            Signup
          </button>
        </div>

        {/* Form Title */}
        <h2 className="text-3xl font-bold text-center mb-8">
          {isSignup ? "Signup Form" : "Login Form"}
        </h2>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {!isSignup && (
            <div className="text-right text-sm text-blue-500 hover:underline cursor-pointer">
              Forgot password?
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-md font-semibold hover:opacity-90"
          >
            {loading ? "Processing..." : isSignup ? "Signup" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
