"use client";

const ChatMessage = ({ message }) => {
  const isMe = message.sender === "me";

  return (
    <div
      className={`text-sm p-2 rounded max-w-[60%] ${
        isMe
          ? "bg-blue-500 text-white ml-auto text-right"
          : "bg-gray-200 text-left"
      }`}
    >
      {message.text}
    </div>
  );
};

export default ChatMessage;
