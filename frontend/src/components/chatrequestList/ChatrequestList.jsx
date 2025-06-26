"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const ChatRequestList = ({ onAccept }) => {
  const [requests, setRequests] = useState([
    { email: "demo1@example.com", status: "pending" },
    { email: "demo2@example.com", status: "pending" },
  ]);

  const handleAccept = (email) => {
    toast.success(`Accepted request from ${email}`);
    setRequests((prev) =>
      prev.map((r) => (r.email === email ? { ...r, status: "accepted" } : r))
    );
    onAccept?.(email);
  };

  const handleReject = (email) => {
    toast.error(`Rejected request from ${email}`);
    setRequests((prev) => prev.filter((r) => r.email !== email));
  };

  return (
    <div className="space-y-4">
      {requests.length === 0 && (
        <p className="text-center text-gray-500">No chat requests</p>
      )}
      {requests.map(({ email, status }) => (
        <Card key={email} className="p-4 flex items-center justify-between">
          <span>{email}</span>
          {status === "pending" ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleAccept(email)}>
                Accept
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReject(email)}
              >
                Reject
              </Button>
            </div>
          ) : (
            <span className="text-green-600 font-medium">Accepted</span>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ChatRequestList;
