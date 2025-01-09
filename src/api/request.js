import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  timeout: 10000,
});

// 不需要 token 的白名单路径
const whiteList = ['/user/login', '/user/register'];

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 确保 config.url 存在
    const currentUrl = config.url || '';
    
    // 判断请求路径是否在白名单中
    const isWhiteList = whiteList.some(path => currentUrl.includes(path));
    
    // 如果不在白名单中，则添加 token
    if (!isWhiteList) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.token = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // 处理 token 相关的错误码
    if ([4001, 4002, 4003].includes(res.code)) {
      // 清除本地存储的 token
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // 显示错误消息
      message.error('登录已过期，请重新登录');
      
      // 使用 setTimeout 确保消息显示后再跳转
      setTimeout(() => {
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }, 1500);
      
      return Promise.reject(new Error(res.message || '登录已过期'));
    }
    
    return res;
  },
  (error) => {
    // 处理网络错误等
    message.error(error.message || '请求失败，请稍后重试');
    return Promise.reject(error);
  }
);

export default request;