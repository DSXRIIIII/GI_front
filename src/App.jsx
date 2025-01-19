import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MainLayout from './layouts/MainLayout';
import ChatWindow from './components/ChatWindow';
import ImageGeneration from './components/ImageGeneration';
import GlobalStyle from './styles/GlobalStyle';
import PictureWindow from './components/PictureWindow';
import DialogueDetail from './pages/DialogueDetail';

const PrivateRoute = ({ children }) => {
  const token = useSelector(state => state.user.token);
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="chat" element={<ChatWindow />} />
            <Route path="picture" element={<PictureWindow />} />
          </Route>
          <Route
            path="/image"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ImageGeneration />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route path="/:type/:id" element={<DialogueDetail />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;