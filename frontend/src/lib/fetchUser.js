export const fetchAcceptedChats = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND}/api/chat/accepted`,
    {
      credentials: "include", // ✅ correct key
    },
  );

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
