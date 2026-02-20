import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  chats: [],
  onlineUsers: [],
  selectedChat: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    setMessages: (state, action) => {
      // Logic: Use this only when loading a chat for the first time
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      // Logic: Check if message already exists (prevent duplicates from socket + local)
      const exists = state.messages.find((m) => m.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    setOnlineUsers: (state, action) => {
      // Logic: Update the "green dot" status for everyone instantly
      state.onlineUsers = action.payload;
    },
    // Added: Real-time read status update
    markAsRead: (state, action) => {
      const { chatId, readerId } = action.payload;
      state.messages = state.messages.map((msg) =>
        msg.chatId === chatId && msg.receiverId === readerId
          ? { ...msg, read: true }
          : msg,
      );
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    updateChat: (state, action) => {
      const chat = action.payload;
      const index = state.chats.findIndex((c) => c.id === chat.id);
      if (index !== -1) {
        state.chats[index] = { ...state.chats[index], ...chat };
      } else {
        state.chats.unshift(chat);
      }
    },
  },
});

export const {
  setMessages,
  addMessage,
  clearMessages,
  setChats,
  updateChat,
  setOnlineUsers,
  markAsRead,
  setSelectedChat,
} = chatSlice.actions;

export default chatSlice.reducer;
