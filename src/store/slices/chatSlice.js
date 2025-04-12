import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    currentModel: 'gpt-3.5-turbo',
    hasShownWelcome: false,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const { recordId, content } = action.payload;
      const message = state.messages.find(msg => msg.recordId === recordId);
      if (message) {
        if (typeof content === 'function') {
          message.content = content(message.content);
        } else {
          message.content = content;
        }
      }
    },
    setCurrentModel: (state, action) => {
      state.currentModel = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setHasShownWelcome: (state, action) => {
      state.hasShownWelcome = action.payload;
    },
  },
});

export const { addMessage, updateMessage, setCurrentModel, clearMessages, setHasShownWelcome } = chatSlice.actions;
export default chatSlice.reducer;