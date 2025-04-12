import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userApi } from '../../api/services';
import styled from 'styled-components';

const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
`;

const LoginCard = styled(Card)`
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();
  const [sendingEmail, setSendingEmail] = useState(false);

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
    </LoginContainer>
  );
};

export default Login;