import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Input, Button, Select, Spin, message } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { chatApi } from '../api/services';
import { addMessage } from '../store/slices/chatSlice';
import java from 'react-syntax-highlighter/dist/cjs/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import golang from 'react-syntax-highlighter/dist/cjs/languages/prism/go';

SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('go', golang);

const ChatContainer = styled.div`
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

// 消息气泡样式
const MessageBubble = styled.div`
  display: flex;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 20px;
`;

const BubbleContent = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${props => props.isUser ? '#1890ff' : '#fff'};
  color: ${props => props.isUser ? '#fff' : '#000'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-break: break-word;

  /* Markdown 基础样式 */
  p {
    margin: 4px 0;
    line-height: 1.7;
  }

  /* 列表样式 */
  ol, ul {
    margin: 4px 0;
    padding-left: 20px;
  }

  li {
    margin: 2px 0;
    line-height: 1.4;
  }

  /* 其他元素样式 */
  blockquote {
    margin: 4px 0;
    padding-left: 12px;
    border-left: 4px solid #ddd;
    color: #666;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 8px 0 4px;
    line-height: 1.4;
  }

  strong {
    font-weight: 600;
    color: ${props => props.isUser ? '#fff' : '#000'};
  }

  /* 行内代码样式 */
  code {
    background: ${props => props.isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Consolas', monospace;
  }
`;

const CodeBlock = styled.div`
  position: relative;
  margin: 8px 0;
  background: #FAFAFA;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E0E0E0;

  /* 代码块顶部栏 */
  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: #F0F0F0;
    border-bottom: 1px solid #E0E0E0;
  }

  .language-label {
    color: #666;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .copy-button {
    padding: 4px 8px;
    background: #E8E8E8;
    border: 1px solid #DDD;
    border-radius: 4px;
    color: #333;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #D8D8D8;
      border-color: #CCC;
    }
  }

  /* 代码内容区域 */
  .code-content {
    padding: 12px;
    
    pre {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Menlo', 'Monaco', 'Consolas', monospace !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      letter-spacing: 0.3px !important;
    }

    /* 优化代码显示 */
    .token.keyword {
      font-weight: 600;
    }
    
    .token.function {
      font-weight: 500;
    }
    
    .token.string {
      font-style: normal;
    }
    
    .token.comment {
      font-style: italic;
    }
  }
`;

const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 360px;
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
  width: 160px;
  min-width: 160px;
`;

const StyledTextArea = styled(Input.TextArea)`
  flex: 1;
`;

const LoadingIcon = styled(LoadingOutlined)`
  font-size: 24px;
  color: #1890ff;
`;

const LoadingContainer = styled.div`
  padding: 8px;
`;

const ChatWindow = () => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('glm-4-flash');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages);
  const userInfo = useSelector(state => state.user.userInfo);
  
  // 添加消息容器的引用
  const messagesEndRef = useRef(null);

  // 滚动到底部的函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息列表更新时，自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const models = [
    { value: 'glm-4-flash', label: 'GLM-4-Flash' },
    { value: 'other-model', label: '其他模型' },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      isLoading: true, // 添加加载状态标记
    };
    dispatch(addMessage(userMessage));
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage({
        user_id: userInfo?.username,
        question: input,
        model: selectedModel,
        role: 'user',
      });

      if (response.code === 200) {
        const aiMessage = {
          type: 'ai',
          content: response.message,
          timestamp: new Date().toISOString(),
        };
        dispatch(addMessage(aiMessage));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('代码已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  // 自定义代码块渲染组件
  const components = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && language) {
        return (
          <CodeBlock>
            <div className="code-header">
              <span className="language-label">{language}</span>
              <button 
                className="copy-button"
                onClick={() => copyToClipboard(String(children))}
              >
                复制代码
              </button>
            </div>
            <div className="code-content">
              <SyntaxHighlighter
                style={oneLight}
                language={language.toLowerCase()}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: 'transparent',
                  fontSize: '14px',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Menlo', 'Monaco', 'Consolas', monospace",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          </CodeBlock>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    }
  };

  return (
    <ChatContainer>
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
                <ReactMarkdown components={components}>
                  {message.content}
                </ReactMarkdown>
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
                handleSend();
              }
            }}
            placeholder="输入消息..."
            autoSize={{ minRows: 1, maxRows: 6 }}
            disabled={isLoading}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={isLoading}
          >
            发送
          </Button>
        </InputWrapper>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatWindow;