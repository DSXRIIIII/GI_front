import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Button, Avatar } from 'antd';
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
import HistoryDialog from './HistoryDialog';

const SidebarContainer = styled.div`
  background: #fff;
  height: 100vh;
  width: 400px;
  min-width: 280px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const NewChatButton = styled(Button)`
  margin-bottom: 16px;
  width: 90%;
  display: block;
  margin-left: auto;
  margin-right: auto;

  &.ant-btn-primary {
    background-color: #2c2c2c;
    border-color: #2c2c2c;
    
    &:hover {
      background-color: #3c3c3c;
      border-color: #3c3c3c;
    }
  }
`;

const MenuContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;

  /* 修改菜单选中和悬浮时的颜色 */
  .ant-menu-item {
    &:hover {
      color: #3c3c3c !important;
    }
    
    &.ant-menu-item-selected {
      background-color: #f0f0f0 !important;
      color: #2c2c2c !important;
      
      &::after {
        border-right-color: #2c2c2c !important;
      }
    }
  }

  /* 修改菜单项图标颜色 */
  .ant-menu-item-selected .anticon {
    color: #2c2c2c !important;
  }
`;

const UserSection = styled.div`
  padding: 10px;
  border-top: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  
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
  const [historyVisible, setHistoryVisible] = useState(false);

  const handleNewChat = () => {
    dispatch(clearMessages());
    navigate('/chat');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleHistoryClick = () => {
    setHistoryVisible(true);
  };

  const handleSelectDialogue = (dialogueId, dialogue) => {
    // 处理选中的历史对话
    console.log('Selected dialogue:', dialogueId, dialogue);
    // TODO: 根据需求处理历史对话的加载
  };

  const menuItems = [
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: '对话',
      onClick: () => navigate('/chat')
    },
    {
      key: 'picture',
      icon: <PictureOutlined />,
      label: '图片生成',
      onClick: () => navigate('/picture')
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '历史记录',
      onClick: handleHistoryClick
    }
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

      <HistoryDialog
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onSelectDialogue={handleSelectDialogue}
      />
    </SidebarContainer>
  );
};

export default Sidebar;