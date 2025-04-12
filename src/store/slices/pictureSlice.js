import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  hasShownWelcome: false,
};

const pictureSlice = createSlice({
  name: 'picture',
  initialState,
  reducers: {
    addPictureMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setHasShownWelcome: (state, action) => {
      state.hasShownWelcome = action.payload;
    },
    clearPictureMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addPictureMessage, setHasShownWelcome, clearPictureMessages } = pictureSlice.actions;
export default pictureSlice.reducer;