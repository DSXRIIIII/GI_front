import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, message, Button, Form, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { userApi } from '../api/services';
import { updateUserInfo } from '../store/slices/userSlice';

const UserMenuContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 400px;
  z-index: 1000;
`;

const InfoDisplay = styled.div`
  margin: 20px 0;
  .info-item {
    margin-bottom: 16px;
    .label {
      font-weight: bold;
      color: #666;
      margin-bottom: 4px;
    }
    .value {
      color: #333;
    }
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    .tag {
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  
  &:hover .avatar-overlay {
    opacity: 1;
  }
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
  cursor: pointer;
  color: white;
`;

const StyledButton = styled(Button)`
  &.ant-btn-primary {
    background-color: #2c2c2c;
    border-color: #2c2c2c;
    
    &:hover {
      background-color: #3c3c3c !important;
      border-color: #3c3c3c !important;
    }

    &:active {
      background-color: #3c3c3c !important;
      border-color: #3c3c3c !important;
    }

    &:focus {
      background-color: #2c2c2c;
      border-color: #2c2c2c;
    }

    &:disabled {
      background-color: #d9d9d9;
      border-color: #d9d9d9;
    }
  }

  &.ant-btn-default {
    &:hover {
      color: #3c3c3c !important;
      border-color: #3c3c3c !important;
    }

    &:active {
      color: #3c3c3c !important;
      border-color: #3c3c3c !important;
    }
  }
`;

const UserMenu = ({ onClose }) => {
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.user.userInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [countdown, setCountdown] = useState(0);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isEmailEditing, setIsEmailEditing] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await userApi.getUserInfo();
        if (response.code === 200) {
          dispatch(updateUserInfo(response.user_info));
        }
      } catch (error) {
        message.error('获取用户信息失败');
      }
    };
    fetchUserInfo();
  }, [dispatch]);

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await userApi.uploadAvatar(formData);
      if (response.code === 200) {
        message.success('头像上传成功');
        // 重新获取用户信息以更新头像
        const userResponse = await userApi.getUserInfo();
        if (userResponse.code === 200) {
          dispatch(updateUserInfo(userResponse.user_info));
        }
      }
    } catch (error) {
      message.error('头像上传失败');
    }
  };

  const handleUpdateInfo = async (values) => {
    try {
      if (!isEmailEditing) {
        const { email, code, ...otherValues } = values;
        const response = await userApi.updateUserInfo({
          user_id: userInfo.UserId,
          ...otherValues
        });
        
        if (response.code === 200) {
          message.success('信息更新成功');
          setIsEditing(false);
          const userResponse = await userApi.getUserInfo();
          if (userResponse.code === 200) {
            dispatch(updateUserInfo(userResponse.user_info));
          }
        }
      } else {
        const response = await userApi.updateUserInfo({
          user_id: userInfo.UserId,
          ...values
        });

        if (response.code === 200) {
          message.success('信息更新成功');
          setIsEditing(false);
          setIsEmailEditing(false);
          const userResponse = await userApi.getUserInfo();
          if (userResponse.code === 200) {
            dispatch(updateUserInfo(userResponse.user_info));
          }
        }
      }
    } catch (error) {
      message.error('信息更新失败');
    }
  };

  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        message.error('请输入邮箱地址');
        return;
      }

      // 校验邮箱是否与当前邮箱相同
      if (email === userInfo?.Email) {
        message.error('新邮箱不能与当前邮箱相同');
        return;
      }

      // 校验邮箱是否被其他用户使用
      const checkResponse = await userApi.checkEmail({ email });
      if (checkResponse.code === 105) {
        message.error('该邮箱已被其他用户使用');
        return;
      }

      // 邮箱校验通过后，发送验证码
      setSendingEmail(true);
      const response = await userApi.sendEmailCode({ email });
      
      if (response.code === 200) {
        message.success('验证码已发送');
        setCountdown(60);
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

  // 邮箱校验函数
  const validateEmail = async (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入邮箱！'));
    }

    // 邮箱格式校验
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error('请输入有效的邮箱地址！'));
    }

    // 如果是修改邮箱，检查是否与当前邮箱相同
    if (isEmailEditing && value === userInfo?.Email) {
      return Promise.reject(new Error('新邮箱不能与当前邮箱相同'));
    }

    try {
      const response = await userApi.checkEmail({ email: value });
      if (response.code === 105) {
        return Promise.reject(new Error('该邮箱已被其他用户使用'));
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('邮箱校验失败，请重试'));
    }
  };

  return (
    <UserMenuContainer>
      <div style={{ textAlign: 'right' }}>
        <Button type="text" onClick={onClose}>×</Button>
      </div>

      <AvatarContainer>
        <Avatar src={userInfo?.AvatarUrl} alt="用户头像" />
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleAvatarUpload(file);
            return false;
          }}
        >
          <AvatarOverlay className="avatar-overlay">
            <span>更换头像</span>
          </AvatarOverlay>
        </Upload>
      </AvatarContainer>

      {!isEditing ? (
        <>
          <InfoDisplay>
            <div className="info-item">
              <div className="label">用户名</div>
              <div className="value">{userInfo?.Username}</div>
            </div>
            <div className="info-item">
              <div className="label">邮箱</div>
              <div className="value">{userInfo?.Email || '未设置'}</div>
            </div>
            <div className="info-item">
              <div className="label">标签</div>
              <div className="tags">
                {userInfo?.Label?.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </InfoDisplay>
          <StyledButton 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => setIsEditing(true)}
            block
          >
            修改信息
          </StyledButton>
        </>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            username: userInfo?.Username,
            email: userInfo?.Email,
            label: userInfo?.Label?.join(', ')
          }}
          onFinish={handleUpdateInfo}
        >
          <Form.Item label="用户名" name="username">
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item label="邮箱">
            <Input.Group compact>
              <Form.Item
                name="email"
                noStyle
                validateTrigger={['onBlur', 'onChange']}
                rules={[
                  { required: isEmailEditing, message: '' },
                  { validator: isEmailEditing ? validateEmail : undefined }
                ]}
              >
                <Input 
                  placeholder="请输入邮箱" 
                  style={{ width: 'calc(100% - 120px)' }}
                  disabled={!isEmailEditing}
                  defaultValue={userInfo?.Email}
                />
              </Form.Item>
              {!isEmailEditing ? (
                <Button
                  style={{ width: '120px' }}
                  onClick={() => setIsEmailEditing(true)}
                >
                  修改邮箱
                </Button>
              ) : (
                <Button
                  style={{ width: '120px' }}
                  disabled={countdown > 0 || sendingEmail}
                  onClick={handleSendCode}
                  loading={sendingEmail}
                >
                  {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          {isEmailEditing && (
            <Form.Item 
              label="验证码" 
              name="code"
              rules={[{ required: true, message: '请输入验证码！' }]}
            >
              <Input placeholder="请输入验证码" />
            </Form.Item>
          )}

          <Form.Item label="标签" name="label">
            <Input placeholder="请输入标签，用逗号分隔" />
          </Form.Item>

          <Form.Item>
            <Button.Group style={{ width: '100%' }}>
              <StyledButton 
                style={{ width: '50%' }} 
                onClick={() => {
                  setIsEditing(false);
                  setIsEmailEditing(false);
                }}
              >
                取消
              </StyledButton>
              <StyledButton 
                type="primary" 
                htmlType="submit" 
                style={{ width: '50%' }}
              >
                保存
              </StyledButton>
            </Button.Group>
          </Form.Item>
        </Form>
      )}
    </UserMenuContainer>
  );
};

export default UserMenu;