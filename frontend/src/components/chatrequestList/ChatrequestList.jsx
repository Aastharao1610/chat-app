"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { getSocket } from "@/lib/socket";
import axios from "axios";

const ChatRequestList = ({ onAccept }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/request/my", {
          withCredentials: true,
        });
        setRequests(res.data.requests);
      } catch (err) {
        toast.error("Failed to load chat requests.");
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewRequest = (data) => {
      setRequests((prev) => {
        const exists = prev.some((req) => req.id === data.id);
        if (!exists) {
          toast.info(`📩 New chat request from user ${data.senderId}`);
          return [...prev, data];
        }
        return prev;
      });
    };

    socket.on("new-chat-request", handleNewRequest);

    return () => {
      socket.off("new-chat-request", handleNewRequest);
    };
  }, []);

  const handleAccept = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/request/accept-request",
        {
          requestId: id,
        },
        {
          withCredentials: true,
        }
      );

      toast.success(`Accepted request`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r))
      );

      onAccept?.(id);

      const socket = getSocket();
      socket?.emit("chat-request-accepted", { requestId: id });
    } catch (error) {
      toast.error("Failed to accept request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/request/reject-request",
        {
          requestId: id,
        },
        {
          withCredentials: true,
        }
      );

      toast.error(`Rejected request`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error("Failed to reject request.");
    }
  };

  return (
    <div className="space-y-4 min-h-screen py-4">
      {requests.length === 0 ? (
        <p className="text-center text-gray-500">No chat requests</p>
      ) : (
        requests.map(({ id, senderId, status }) => (
          <Card key={id} className="p-4 flex items-center justify-between">
            <span>From user ID: {senderId}</span>
            {status === "pending" ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAccept(id)}>
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(id)}
                >
                  Reject
                </Button>
              </div>
            ) : (
              <span className="text-green-600 font-medium">Accepted</span>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default ChatRequestList;
