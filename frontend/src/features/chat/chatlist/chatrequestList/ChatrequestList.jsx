// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { Button } from "@/components/ui/button";
// const ChatRequestList = () => {
//   const [requests, setRequests] = useState([]);
//   const { user } = useSelector((state) => state.auth);

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         const res = await axios.get(`/api/request/my`, {
//           withCredentials: true,
//         });
//         console.log(res, "res");
//         setRequests(res.data.requests || []);
//       } catch (err) {
//         toast.error("Failed to load chat requests");
//       }
//     };

//     fetchRequests();
//   }, []);

//   const handleAccept = async (requestId) => {
//     try {
//       const res = await axios.post(
//         `/api/request/accept-request/`,
//         { requestId },
//         { withCredentials: true },
//       );
//       console.log(res, "res");
//       toast.success("Request accepted");
//       setRequests((prev) => prev.filter((request) => request.id !== requestId));
//     } catch (err) {
//       toast.error("Failed to accept request");
//     }
//   };

//   return (
//     <div className="p-4 space-y-3">
//       {requests.length === 0 ? (
//         <p className="text-gray-400 text-sm">No pending requests</p>
//       ) : (
//         requests.map((req) => (
//           <div
//             key={req.id}
//             className="flex items-center justify-between p-3 border rounded-md shadow-sm bg-white"
//           >
//             <div>
//               <p className="font-medium text-gray-800">{req.sender?.name}</p>
//               <p className="text-sm text-blue-500">{req.sender?.email}</p>
//             </div>
//             <Button size="sm" onClick={() => handleAccept(req.id)}>
//               Accept
//             </Button>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default ChatRequestList;

"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus2 } from "lucide-react"; // Icons for state
import { cn } from "@/lib/utils";

const ChatRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Track which button is loading

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`/api/request/my`, {
          withCredentials: true,
        });
        setRequests(res.data.requests || []);
      } catch (err) {
        toast.error("Failed to load chat requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    setProcessingId(requestId); // Start loading for THIS specific request
    try {
      await axios.post(
        `/api/request/accept-request/`,
        { requestId },
        { withCredentials: true },
      );
      toast.success("Request accepted!");
      // Smoothly remove from list
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (err) {
      toast.error("Failed to accept request");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse text-gray-400 text-sm">
        Checking for requests...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-transparent">
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
            <UserPlus2 className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            No pending requests
          </p>
          <p className="text-gray-400 text-xs mt-1">
            When people want to chat, they'll appear here.
          </p>
        </div>
      ) : (
        requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm bg-white dark:bg-[#1f2937] transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              {/* Small Avatar Initial */}
              <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                {req.sender?.name?.charAt(0).toUpperCase() || "?"}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {req.sender?.name}
                </p>
                <p className="text-xs text-gray-500 truncate italic">
                  wants to connect
                </p>
              </div>
            </div>

            <Button
              size="sm"
              className="rounded-full px-5 bg-blue-600 hover:bg-blue-700 text-white transition-all"
              onClick={() => handleAccept(req.id)}
              disabled={processingId === req.id}
            >
              {processingId === req.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatRequestList;
