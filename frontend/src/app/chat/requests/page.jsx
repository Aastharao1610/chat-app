"use client";
import ChatRequestList from "@/components/chatrequestList/ChatrequestList";

const RequestPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-semibold mb-4">Pending Chat Requests</h1>
      <ChatRequestList />
    </div>
  );
};

export default RequestPage;
