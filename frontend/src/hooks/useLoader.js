// hooks/useLoadUser.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { login } from "@/store/authSlice";

const useLoadUser = () => {
  const dispatch = useDispatch(); // ✅ Add this!
  console.log(process.env.NEXT_PUBLIC_BACKEND, "BACKENDDDD");
  useEffect(() => {
    console.log("User Loader called");
    const loadUser = async () => {
      console.log("object");
      try {
        console.log("Try called");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/me`,
          {
            withCredentials: true,
          },
        );
        console.log(res, "responsee ggg");
        if (res.data?.user) {
          dispatch(login({ user: res.data.user, token: null }));
        }
      } catch (err) {
        console.log("❌ Error caught");
        console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
        console.log("User not logged in or token invalid");
      }
    };

    loadUser();
  }, [dispatch]);
};

export default useLoadUser;
