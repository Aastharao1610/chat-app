import axios from "axios";
import { login } from "../store/authSlice";

export const fetchUser = async (dispatch) => {
  try {
    const res = await axios.get("http://localhost:5000/api/auth/me", {
      withCredentials: true,
    });

    dispatch(
      login({
        user: res.data.user,
        token: null, // You can skip token if you're only using cookies
      })
    );
  } catch (error) {
    console.error("Failed to fetch user:", error);
  }
};
