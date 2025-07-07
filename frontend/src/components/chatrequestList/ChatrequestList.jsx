"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

const ChatRequestList = () => {
  const [requests, setRequests] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/request/my", {
          withCredentials: true,
        });
        console.log(res, "res");
        setRequests(res.data.requests || []);
      } catch (err) {
        toast.error("Failed to load chat requests");
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/request/accept-request/`,
        { requestId },
        { withCredentials: true }
      );
      console.log(res, "res");
      toast.success("Request accepted");
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  return (
    <div className="p-4 space-y-3">
      {requests.length === 0 ? (
        <p className="text-gray-400 text-sm">No pending requests</p>
      ) : (
        requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between p-3 border rounded-md shadow-sm bg-white"
          >
            <div>
              <p className="font-medium text-gray-800">{req.sender?.name}</p>
              {/* <p className="text-sm text-blue-500">{req.sender?.email}</p> */}
            </div>
            <Button size="sm" onClick={() => handleAccept(req.id)}>
              Accept
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatRequestList;
