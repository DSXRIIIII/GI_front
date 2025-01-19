import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Input, Button, Select, Spin } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { chatApi } from '../api/services';
import { addPictureMessage } from '../store/slices/pictureSlice';
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

const PictureWindow = () => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('chatglm-4v-plus');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogueId, setDialogueId] = useState('');
  const dispatch = useDispatch();
  const messages = useSelector(state => state.picture.messages);
  const userInfo = useSelector(state => state.user.userInfo);
  const messagesEndRef = useRef(null);

  const models = [
    { value: 'chatglm-4v-plus', label: 'ChatGLM-4V-Plus' },
  ];

  useEffect(() => {
    setDialogueId(nanoid());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerate = async () => {
    if (!input.trim() || isLoading) return;

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
        model: selectedModel,
        dialogue_id: dialogueId,
        record_id: recordId,
      });

      if (response.code === 200) {
        const aiMessage = {
          type: 'ai',
          content: response.message[0].url,
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
              {message.type === 'user' ? (
                message.content
              ) : (
                <GeneratedImage src={message.content} alt="Generated" />
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