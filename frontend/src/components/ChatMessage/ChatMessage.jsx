// src/components/ChatMessage/ChatMessage.jsx
"use client";

const ChatMessages = ({ messages = [], currentUser }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-background">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center">No messages yet</p>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded max-w-sm ${
              msg.senderId === currentUser?.id
                ? "bg-blue-500 text-white self-end ml-auto text-right"
                : "bg-gray-200 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatMessages;
