import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Divider, List, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { logout } from '../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const UserCenterContainer = styled.div`
  background: #fff;
  height: 100vh;
  border-left: 1px solid #f0f0f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
`;

const UserMeta = styled.div`
  margin-left: 12px;
`;

const ChatHistoryContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const UserCenter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.user.userInfo);
  const messages = useSelector(state => state.chat.messages);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // 将消息按日期分组
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <UserCenterContainer>
      <UserInfo>
        <Avatar size={64} icon={<UserOutlined />} />
        <UserMeta>
          <Title level={4}>{userInfo?.username || '用户'}</Title>
          <Button 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            type="link"
            danger
          >
            退出登录
          </Button>
        </UserMeta>
      </UserInfo>

      <Divider>最近对话</Divider>

      <ChatHistoryContainer>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <Text type="secondary">{date}</Text>
            <List
              itemLayout="horizontal"
              dataSource={dateMessages}
              renderItem={(message, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={message.type === 'user' ? <UserOutlined /> : '🤖'} 
                      />
                    }
                    title={message.type === 'user' ? '你' : 'AI'}
                    description={
                      <Text ellipsis={{ tooltip: message.content }}>
                        {message.content}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        ))}
      </ChatHistoryContainer>
    </UserCenterContainer>
  );
};

export default UserCenter;