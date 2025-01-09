import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    currentModel: 'gpt-3.5-turbo',
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setCurrentModel: (state, action) => {
      state.currentModel = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setCurrentModel, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;