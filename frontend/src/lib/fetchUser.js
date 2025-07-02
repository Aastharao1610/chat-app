// import axios from "axios";
// import { login } from "../store/authSlice";

// export const fetchUser = async (dispatch) => {
//   try {
//     const res = await axios.get("http://localhost:5000/api/auth/me", {
//       withCredentials: true,
//     });

//     dispatch(
//       login({
//         user: res.data.user,
//         token: null, // You can skip token if you're only using cookies
//       })
//     );
//   } catch (error) {
//     console.error("Failed to fetch user:", error);
//   }
// };

export const fetchAcceptedChats = async () => {
  const res = await fetch("http://localhost:5000/api/chat/accepted", {
    credentials: "include", // ✅ correct key
  });

  if (!res.ok) throw new Error("Failed to fetch chats");

  const data = await res.json();
  return {
    chats: Array.isArray(data?.chats) ? data.chats : [],
  };
};

export const fetchRequests = async () => {
  const res = await fetch("/api/chat/requests");
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
};

export const acceptRequest = async (id) => {
  const res = await fetch(`/api/chat/accept/${id}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to accept request");
};
