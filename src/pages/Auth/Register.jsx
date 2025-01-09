import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import styled from 'styled-components';
import { userApi } from '../../api/services';

const RegisterContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
`;

const RegisterCard = styled(Card)`
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      const response = await userApi.register(values);
      if (response.code === 200) {
        message.success('注册成功');
        navigate('/login');
      } else if (response.code === 103) {
        // 当错误码为 102 时，显示具体的错误信息
        message.error(response.message || '注册失败');
        console.error('注册错误:', response.message);
      } else {
        message.error(response.message || '注册失败');
      }
    } catch (error) {
      message.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 邮箱校验函数
  const validateEmail = async (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入邮箱！'));
    }
    try {
      const response = await userApi.checkEmail({ email: value });
      if (response.code === 105) {
        return Promise.reject(new Error('该邮箱已被注册，请直接登录或使用其他邮箱'));
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('邮箱校验失败，请重试'));
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard title="注册">
        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="邮箱"
            name="email"
            validateTrigger="onBlur"  // 失去焦点时触发校验
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' },
              { validator: validateEmail }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>

          <Button type="link" onClick={() => navigate('/login')} block>
            已有账号？立即登录
          </Button>
        </Form>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;