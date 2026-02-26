const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  incomingCall: null,
  activeCall: null,
};
const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },

    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
    },
    resetCallState: (state) => {
      state.incomingCall = null;
      state.activeCall = false;
    },
  },
});
export const { setIncomingCall, setActiveCall, resetCallState } =
  callSlice.actions;

export default callSlice.reducer;
