import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Button, Dropdown, Avatar,Popover } from 'antd';
import UserCenter from './UserCenter';
import {
  MessageOutlined,
  PictureOutlined,
  HistoryOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { clearMessages } from '../store/slices/chatSlice';
import { logout } from '../store/slices/userSlice';
import UserMenu from './UserMenu';

const SidebarContainer = styled.div`
  background: #fff;
  height: 100vh;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const NewChatButton = styled(Button)`
  margin-bottom: 16px;
  width: 100%;
`;

const MenuContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const UserSection = styled.div`
  padding: 10px;
  border-top: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
  
  .username {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.user.userInfo);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNewChat = () => {
    dispatch(clearMessages());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: '对话',
    },
    {
      key: 'image',
      icon: <PictureOutlined />,
      label: '图片生成',
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '历史记录',
    },
  ];

  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'logout':
        handleLogout();
        break;
      case 'profile':
        // 处理个人信息
        break;
      case 'settings':
        // 处理设置
        break;
      default:
        break;
    }
  };

  return (
    <SidebarContainer>
      <NewChatButton
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleNewChat}
      >
        新建对话
      </NewChatButton>
      
      <MenuContainer>
        <Menu
          mode="inline"
          defaultSelectedKeys={['chat']}
          items={menuItems}
        />
      </MenuContainer>

      <UserSection onClick={() => setShowUserMenu(true)}>
        <Avatar 
          size={32} 
          icon={<UserOutlined />}
          src={userInfo?.AvatarUrl}
        />
        <UserInfo>
          <div className="username">{userInfo?.Username || '用户'}</div>
        </UserInfo>
      </UserSection>

      {showUserMenu && (
        <UserMenu onClose={() => setShowUserMenu(false)} />
      )}
    </SidebarContainer>
  );
};

export default Sidebar;