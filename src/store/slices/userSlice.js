import { createSlice } from '@reduxjs/toolkit';

// 从 localStorage 获取初始状态
const getInitialState = () => {
  return {
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    // 添加用户名和密码的初始状态
    username: localStorage.getItem('username') || null,
    password: localStorage.getItem('password') || null,
  };
};

const userSlice = createSlice({
  name: 'user',
  initialState: getInitialState(),
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.userInfo = null;
      state.username = null;
      state.password = null;
      // 清除所有存储的信息
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    },
    updateUserInfo: (state, action) => {
      state.userInfo = {
        ...state.userInfo,
        ...action.payload
      };
      localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
    },
    setLoginInfo: (state, action) => {
      const { username, password } = action.payload;
      state.username = username;
      state.password = password;
      // 存储到 localStorage
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      localStorage.setItem('isLoggedIn', 'true');
    },
  },
});

export const { setUserInfo, setToken, logout, updateUserInfo, setLoginInfo } = userSlice.actions;
export default userSlice.reducer;