"use client";
import { useSelector } from "react-redux";
import { Video, Phone, Users, ChevronDown } from "lucide-react";

const ChatHeader = ({ selectedUser }) => {
  const { user: currentUser } = useSelector((state) => state.auth);

  return (
    <div className="flex justify-between items-center px-4 py-3 border-b bg-white shadow-sm">
      {/* Left: Chat partner info */}
      <div className="flex items-center gap-3">
        <img
          src={`https://ui-avatars.com/api/?name=${selectedUser.name}`}
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium text-gray-900">{selectedUser.name}</p>
          <p className="text-xs text-gray-500">Typing...</p>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {/* Display user avatars if in a group - optional */}
          {/* <img
            className="w-7 h-7 rounded-full border border-white"
            src={`https://ui-avatars.com/api/?name=${currentUser.name}`}
            alt="user"
          /> */}
        </div>
        <Phone className="text-gray-600 cursor-pointer hover:text-black" />
        <Video className="text-gray-600 cursor-pointer hover:text-black" />
        <Users className="text-gray-600 cursor-pointer hover:text-black" />
        <ChevronDown className="text-gray-600 cursor-pointer hover:text-black" />
      </div>
    </div>
  );
};

export default ChatHeader;
