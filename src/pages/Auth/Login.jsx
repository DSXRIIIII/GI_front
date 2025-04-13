import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userApi } from '../../api/services';
import styled from 'styled-components';
import backgroundImage from '../../assets/背景.png';
import BlurText from '../../components/BlurText';

const { Title } = Typography;

const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: url(${backgroundImage}) no-repeat center center fixed;
  background-size: cover;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledTitle = styled.div`
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: bold;
  color: #000000;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const LoginCard = styled(Card)`
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  
  .ant-tabs-nav::before {
    border-bottom: none;
  }
  
  .ant-tabs-tab {
    font-size: 16px;
    padding: 12px 0;
  }
  
  .ant-form-item-label > label {
    font-weight: 500;
  }
  
  .ant-input, .ant-input-password {
    border-radius: 4px;
    height: 40px;
  }
  
  .ant-btn {
    height: 40px;
    border-radius: 4px;
    font-weight: 500;
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleAnimationComplete = () => {
    console.log('Title animation completed!');
  };

  // 处理账号密码登录
  const handlePasswordLogin = async (values) => {
    try {
      setLoading(true);
      const response = await userApi.login(values);
      if (response.code === 200) {
        message.success('登录成功');
        navigate('/chat');
      } else if (response.code === 102) {
        message.error('用户不存在，请先注册');
        navigate('/register');  // 自动跳转到注册页面
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理发送验证码
  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        message.error('请输入邮箱地址');
        return;
      }

      setSendingEmail(true);

      const response = await userApi.sendEmailCode({ email });
      if (response.code === 200) {
        message.success('验证码已发送');
        setCountdown(60); // 开始60秒倒计时
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        message.error(response.message || '发送验证码失败');
      }
    } catch (error) {
      message.error('发送验证码失败');
    } finally {
      setSendingEmail(false);
    }
  };

  // 处理邮箱验证码登录
  const handleEmailLogin = async (values) => {
    try {
      setLoading(true);
      const response = await userApi.emailLogin(values);
      if (response.code === 200) {
        localStorage.setItem('user_id', response.user_id);
        message.success('登录成功');
        navigate('/chat');
      } else if (response.code === 102) {
        message.error('用户不存在，请先注册');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'password',
      label: '账号密码登录',
      children: (
        <Form
          name="password_login"
          onFinish={handlePasswordLogin}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'email',
      label: '邮箱验证码登录',
      children: (
        <Form
          form={form}
          name="email_login"
          onFinish={handleEmailLogin}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="验证码" required>
            <Input.Group compact>
              <Form.Item
                name="code"
                noStyle
                rules={[{ required: true, message: '请输入验证码！' }]}
              >
                <Input style={{ width: 'calc(100% - 120px)' }} />
              </Form.Item>
              <Button
                style={{ width: '120px' }}
                disabled={countdown > 0 || sendingEmail}
                onClick={handleSendCode}
                loading={sendingEmail}
              >
                {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
              </Button>
            </Input.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <LoginContainer>
      <ContentWrapper>
        <StyledTitle>
          <BlurText
            text="GI智能问答 | AI助手🤩"
            delay={100}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
          />
        </StyledTitle>
        <LoginCard>
          <Tabs
            defaultActiveKey="password"
            items={items}
            centered
          />
          <Button type="link" onClick={() => navigate('/register')} block>
            还没有账号？立即注册
          </Button>
        </LoginCard>
      </ContentWrapper>
    </LoginContainer>
  );
};

export default Login;