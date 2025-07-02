// hooks/useLoadUser.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { login } from "@/store/authSlice";

const useLoadUser = () => {
  const dispatch = useDispatch(); // ✅ Add this!

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });

        if (res.data?.user) {
          dispatch(login({ user: res.data.user, token: null }));
        }
      } catch (err) {
        console.log("User not logged in or token invalid");
      }
    };

    loadUser();
  }, [dispatch]);
};

export default useLoadUser;
