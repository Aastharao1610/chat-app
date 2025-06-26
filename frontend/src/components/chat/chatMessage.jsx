// components/chat/ChatMessages.jsx
const ChatMessages = () => (
  <div className="flex-1 overflow-y-auto p-4 space-y-2">
    <div className="text-left bg-gray-200 p-2 rounded max-w-sm">
      Hello there!
    </div>
    <div className="text-right bg-blue-500 text-white p-2 rounded max-w-sm ml-auto">
      Hi! What's up?
    </div>
  </div>
);

export default ChatMessages;
