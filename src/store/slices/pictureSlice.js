import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
};

const pictureSlice = createSlice({
  name: 'picture',
  initialState,
  reducers: {
    addPictureMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearPictureMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addPictureMessage, clearPictureMessages } = pictureSlice.actions;
export default pictureSlice.reducer;