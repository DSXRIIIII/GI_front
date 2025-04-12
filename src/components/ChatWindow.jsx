import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { createGlobalStyle } from 'styled-components';
import { Input, Button, Select, Spin, message } from 'antd';
import { SendOutlined, LoadingOutlined, FileImageOutlined, FileOutlined, ClearOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { chatApi, bilibiliApi } from '../api/services';
import { addMessage, setHasShownWelcome, updateMessage } from '../store/slices/chatSlice';
import java from 'react-syntax-highlighter/dist/cjs/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import golang from 'react-syntax-highlighter/dist/cjs/languages/prism/go';
import { nanoid } from 'nanoid';
import bilibiliIcon from '../icons/bilibili.png';

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
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  margin-bottom: 140px;
  
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
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
  background-color: ${props => props.isUser ? '#2c2c2c' : '#fff'};
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
  left: 400px;
  right: 0;
  background: white;
  padding: 16px 20px;
  border-top: 1px solid rgba(232, 232, 232, 0.8);
  z-index: 1000;
`;

const ToolbarContainer = styled.div`
  padding: 4px 0;
  display: flex;
  gap: 8px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 12px;
`;

const ToolbarButton = styled(Button)`
  &.ant-btn {
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    font-size: 13px;
    height: 36px;
    color: rgba(0, 0, 0, 0.65);
    
    &:hover,
    &:focus {
      color: #000000;
      border-color: #000000;
      background: rgba(0, 0, 0, 0.05);
    }

    .anticon {
      color: inherit;
    }
  }

  &.ant-btn-primary {
    background: #000000;
    border-color: #000000;
    color: #ffffff;

    &:hover,
    &:focus {
      background: #2c2c2c !important;
      border-color: #2c2c2c !important;
      color: #ffffff;
    }
  }
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
  resize: none;  // 禁用拖拉调整大小
`;

const LoadingIcon = styled(LoadingOutlined)`
  font-size: 24px;
  color: #2c2c2c;
`;

const LoadingContainer = styled.div`
  padding: 8px;
`;

// 创建自定义图标组件
const BilibiliIcon = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
`;

const SendButton = styled(Button)`
  &.ant-btn {
    background: #000000;
    border-color: #000000;
    color: #ffffff;
    
    &:hover,
    &:focus {
      background: #2c2c2c;  // 浅一点的黑色
      border-color: #2c2c2c;
      color: #ffffff;
    }
    
    &:active {
      background: #404040;  // 点击时更浅的黑色
      border-color: #404040;
    }
  }
`;

// 覆盖全局 antd 按钮样式
const GlobalStyle = createGlobalStyle`
  .ant-btn:hover,
  .ant-btn:focus {
    background: rgba(0, 0, 0, 0.05) !important;
    border-color: #000000 !important;
    color: #000000 !important;
  }

  .ant-btn-primary:hover,
  .ant-btn-primary:focus {
    background: #2c2c2c !important;
    color: #ffffff !important;
  }
`;

const ChatWindow = () => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('glm-4-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogueId, setDialogueId] = useState('');
  const [streamContent, setStreamContent] = useState('');
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages);
  const hasShownWelcome = useSelector(state => state.chat.hasShownWelcome);
  
  // 添加消息容器的引用
  const messagesEndRef = useRef(null);

  // 组件挂载时生成新的对话ID，并确保只生成一次
  useEffect(() => {
    // 如果 dialogueId 为空，才生成新的
    if (!dialogueId) {
      const newDialogueId = nanoid();
      setDialogueId(newDialogueId);
    }

    // 只在组件挂载时显示欢迎消息
    if (!hasShownWelcome) {
      const welcomeMessage = {
        type: 'system',
        content: '欢迎来到超酷的 [GI] 智能体平台🥳！\n\n' +
                 'DeepSeek、ChatGLM 等超强大的对话模型已经准备好与你畅聊啦🤖。\n\n' +
                 '它们就像知识渊博的伙伴🧑‍🤝‍🧑，时刻待命。\n\n' +
                 '现在，只需动动手指🖱️，在下方的输入框中大胆分享你的想法、疑问、故事💬。\n\n' +
                 '无论是探索宇宙奥秘🌌，还是讨论生活趣事😃，亦或是寻求创意灵感🎨，都没问题。\n\n' +
                 '即刻开启这场充满惊喜的智能交互之旅吧🚀，每一次对话都可能带来意想不到的收获✨！',
        timestamp: new Date().toISOString(),
        recordId: nanoid(),
      };
      dispatch(addMessage(welcomeMessage));
      dispatch(setHasShownWelcome(true));
    }
  }, [dialogueId, hasShownWelcome, dispatch]);

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
    { value: 'deepseek-v3', label: 'DeepSeek-V3' },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const recordId = nanoid();
    // 发送用户消息
    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      recordId: recordId + '_user',  // 为用户消息添加特定标识
    };
    dispatch(addMessage(userMessage));
    setInput('');
    setIsLoading(true);

    try {
      // 创建 AI 回复的消息
      const aiMessage = {
        type: 'ai',
        content: '',  // 初始内容为空
        timestamp: new Date().toISOString(),
        recordId: recordId + '_ai',  // 为 AI 消息添加特定标识
      };
      dispatch(addMessage(aiMessage));

      await chatApi.sendMessage({
        user_id: localStorage.getItem('user_id'),
        question: input,
        model: selectedModel,
        role: 'user',
        dialogue_id: dialogueId,
        record_id: recordId,
      }, (chunk) => {
        // 更新 AI 消息的内容
        dispatch(updateMessage({
          recordId: recordId + '_ai',  // 使用 AI 消息的 recordId
          content: (prevContent) => prevContent + chunk
        }));
      });

    } catch (error) {
      console.error('Error sending message:', error);
      message.error('发送消息失败');
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
    },
    a: ({node, children, href, ...props}) => {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }
  };

  const handleBilibiliHotspot = async () => {
    if (isLoading) return;

    // 获取当前日期并格式化
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dateStr = `${year}年${month}月${day}日`;

    const recordId = nanoid();
    const userMessage = {
      type: 'user',
      content: `${dateStr}B站热点`,
      timestamp: new Date().toISOString(),
      recordId,
    };
    dispatch(addMessage(userMessage));
    setIsLoading(true);

    try {
      const response = await bilibiliApi.getHotspot();
      if (response.code === 200) {
        const aiMessage = {
          type: 'ai',
          content: `### 🔥 B站热点榜 ${dateStr}\n\n` +
                   `${response.report.report}\n\n` +
                   `---\n\n` +
                   `> 💡 想了解更多精彩内容？[点击查看 B站热门视频](https://www.bilibili.com/v/popular)\n\n` +
                   `*数据更新时间：${new Date().toLocaleTimeString()}*`,
          timestamp: new Date().toISOString(),
          recordId,
        };
        dispatch(addMessage(aiMessage));
      }
    } catch (error) {
      console.error('Error fetching bilibili hotspot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
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
          <ToolbarContainer>
            <ToolbarButton 
              icon={<BilibiliIcon src={bilibiliIcon} alt="bilibili" />}
              onClick={handleBilibiliHotspot}
              disabled={isLoading}
            >
              B站热点
            </ToolbarButton>
            <ToolbarButton icon={<FileOutlined />}>
              上传文件
            </ToolbarButton>
            <ToolbarButton icon={<ClearOutlined />}>
              清空对话
            </ToolbarButton>
          </ToolbarContainer>
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
            <SendButton 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={isLoading}
            >
              发送
            </SendButton>
          </InputWrapper>
        </InputContainer>
      </ChatContainer>
    </>
  );
};

export default ChatWindow;