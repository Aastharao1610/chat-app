"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { getSocket } from "@/lib/socket";

const ChatRequestModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useSelector((state) => state.auth);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/request/send`,
        { senderId: currentUser.id, receiverEmail: email },
        { withCredentials: true },
      );

      const socket = getSocket();
      socket?.emit("new-chat-request", response.data.request);

      toast.success("Request sent successfully");
      onClose();
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] p-6 gap-0   [&>button]:cursor-pointer">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Invite to Chat
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Send a request to start a conversation.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
              User Email
            </label>
            <Input
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 border-gray-200 shadow-sm focus-visible:ring-1 focus-visible:ring-gray-400"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 cursor-pointer h-10 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !email}
              className="flex-1 h-10 cursor-pointer bg-black text-white hover:bg-gray-800 transition-colors font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatRequestModal;
