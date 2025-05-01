import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Input, Button, Select, Spin } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { chatApi } from '../api/services';
import { addPictureMessage, setHasShownWelcome } from '../store/slices/pictureSlice';
import { nanoid } from 'nanoid';

const PictureContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  margin-bottom: 140px;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 20px;
`;

const BubbleContent = styled.div`
  max-width: 450px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${props => props.isUser ? '#2c2c2c' : '#fff'};
  color: ${props => props.isUser ? '#fff' : '#000'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: pre-wrap;
  word-break: break-word;
`;

const GeneratedImage = styled.img`
  max-width: 400px;
  width: 100%;
  height: auto;
  margin-top: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 400px;
  right: 0;
  background: white;
  padding: 20px;
  border-top: 1px solid #e8e8e8;
  z-index: 1000;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
`;

const ModelSelect = styled(Select)`
  width: 200px;
  min-width: 200px;
`;

const StyledTextArea = styled(Input.TextArea)`
  flex: 1;
`;

const LoadingIcon = styled(LoadingOutlined)`
  font-size: 24px;
  color: #2c2c2c;
`;

const LoadingContainer = styled.div`
  padding: 8px;
`;

const StyledButton = styled(Button)`
  &.ant-btn-primary {
    background-color: #2c2c2c;
    border-color: #2c2c2c;
    
    &:hover {
      background-color: #3c3c3c;
      border-color: #3c3c3c;
    }

    &:disabled {
      background-color: #d9d9d9;
      border-color: #d9d9d9;
    }
  }
`;

// 添加模型配置集合
const MODEL_OPTIONS = {
  'chatglm-4v-plus': {
    value: 'glm-4-flash', // API 请求使用的实际值
    label: 'ChatGLM-4V-Plus', // 展示给用户看的标签
    description: '通用图像生成模型' // 可选的描述信息
  },
  // 后续可以方便地添加更多模型
  'liblib-ai': {
    value: 'liblib-ai',
    label: 'LiblibAI-F.1',
    description: 'liblib图像生成模型'
  },
};

const PictureWindow = () => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('chatglm-4v-plus');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogueId, setDialogueId] = useState(nanoid());
  const dispatch = useDispatch();
  const messages = useSelector(state => state.picture.messages);
  const messagesEndRef = useRef(null);
  const hasShownWelcome = useSelector(state => state.picture.hasShownWelcome);

  // 将模型选项转换为 Select 组件需要的格式
  const models = Object.entries(MODEL_OPTIONS).map(([key, model]) => ({
    value: key,
    label: model.label
  }));

  useEffect(() => {
    if (!hasShownWelcome) {
      // 添加欢迎话术
      const welcomeMessage = {
        type: 'system',
        content: '欢迎来到 [GI] 智能体图像生成平台🎨！\n\n' +
                 '这里有强大的 ChatGLM-4V-Plus 图像生成模型，可以将您的创意转化为精美的图像✨。目前正在开发LiblibAI生图功能... 敬请期待\n\n' +
                 '您可以尝试描述：\n' +
                 '• 一个具体的场景或物体🌅\n' +
                 '• 特定的艺术风格或滤镜效果🎭\n' +
                 '• 色彩、构图的细节要求🖼️\n\n' +
                 '现在，请在下方输入框中描述您想要生成的图片吧！🚀',
        timestamp: new Date().toISOString(),
        recordId: nanoid(),
      };
      dispatch(addPictureMessage(welcomeMessage));
      dispatch(setHasShownWelcome(true));
    }
  }, [hasShownWelcome, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerate = async () => {
    if (!input.trim() || isLoading) return;

    // 如果 dialogueId 为空，重新生成一个
    if (!dialogueId) {
      setDialogueId(nanoid());
    }

    const recordId = nanoid();
    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      recordId,
    };
    dispatch(addPictureMessage(userMessage));
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.generateImage({
        user_id: localStorage.getItem('user_id'),
        question_about_picture: input,
        model: MODEL_OPTIONS[selectedModel].value,
        dialogue_id: dialogueId,
        record_id: recordId,
      });

      if (response.code === 200) {
        const aiMessage = {
          type: 'ai',
          content: response.message.url,
          timestamp: new Date().toISOString(),
          recordId,
        };
        dispatch(addPictureMessage(aiMessage));
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PictureContainer>
      <MessagesContainer>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.type === 'user'}>
            {message.type === 'user' && isLoading && index === messages.length - 1 && (
              <LoadingContainer>
                <Spin indicator={<LoadingIcon spin />} />
              </LoadingContainer>
            )}
            <BubbleContent isUser={message.type === 'user'}>
              {message.type === 'ai' ? (
                <GeneratedImage src={message.content} alt="Generated" />
              ) : (
                message.content // 直接显示文本内容
              )}
            </BubbleContent>
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <InputWrapper>
          <ModelSelect
            value={selectedModel}
            onChange={setSelectedModel}
            options={models}
            placeholder="选择模型"
            disabled={isLoading}
          />
          <StyledTextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey && !isLoading) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="描述你想要生成的图片..."
            autoSize={{ minRows: 1, maxRows: 6 }}
            disabled={isLoading}
          />
          <StyledButton 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleGenerate}
            disabled={isLoading}
          >
            生成
          </StyledButton>
        </InputWrapper>
      </InputContainer>
    </PictureContainer>
  );
};

export default PictureWindow;