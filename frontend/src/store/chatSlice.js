// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   messages: [],
//   chats: [], // for ChatList
// };

// const chatSlice = createSlice({
//   name: "chat",
//   initialState,
//   reducers: {
//     setMessages: (state, action) => {
//       state.messages = action.payload;
//     },
//     addMessage: (state, action) => {
//       state.messages.push(action.payload);
//     },
//     clearMessages: (state) => {
//       state.messages = [];
//     },
//     setChats: (state, action) => {
//       state.chats = action.payload;
//     },
//     updateChat: (state, action) => {
//       const updatedChat = action.payload;
//       const index = state.chats.findIndex((c) => c.id === updatedChat.id);
//       if (index !== -1) {
//         state.chats[index] = updatedChat;
//       } else {
//         state.chats.unshift(updatedChat); // new chat
//       }
//     },
//   },
// });

// export const { setMessages, addMessage, clearMessages, setChats, updateChat } =
//   chatSlice.actions;

// export default chatSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  chats: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      if (typeof action.payload === "function") {
        state.messages = action.payload(state.messages);
      } else {
        state.messages = action.payload;
      }
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
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

export const { setMessages, addMessage, clearMessages, setChats, updateChat } =
  chatSlice.actions;

export default chatSlice.reducer;
