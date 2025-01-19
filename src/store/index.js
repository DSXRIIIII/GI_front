import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import userReducer from './slices/userSlice';
import pictureReducer from './slices/pictureSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
    picture: pictureReducer,
  },
});