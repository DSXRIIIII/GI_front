import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { chatApi } from '../api/services';
import ReactMarkdown from 'react-markdown';
import { Spin, Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

// 对话容器
const DialogueContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
  height: calc(100vh - 120px); // 修改这里，增加底部间距
  overflow-y: auto;
  margin-bottom: 80px; // 添加底部间距，确保内容不被按钮遮挡
`;

// 消息气泡容器
const MessageBubble = styled.div`
  display: flex;
  flex-direction: ${props => props.isQuestion ? 'row-reverse' : 'row'};
  margin-bottom: 20px;
  padding: 0 20px;
`;

// 气泡内容
const BubbleContent = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${props => props.isQuestion ? '#2c2c2c' : '#fff'}; // 从蓝色改为深灰色
  color: ${props => props.isQuestion ? '#fff' : '#000'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* Markdown 样式 */
  p {
    margin: 0;
    line-height: 1.6;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  code {
    background: ${props => props.isQuestion ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    padding: 2px 4px;
    border-radius: 4px;
  }
`;

// 生成的图片样式
const GeneratedImage = styled.img`
  max-width: 400px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

// 底部按钮容器
const BottomButtonContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  z-index: 1000;
`;

const StyledButton = styled(Button)`
  min-width: 120px;
  height: 40px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &.ant-btn-primary {
    background-color: #2c2c2c; // 按钮也改为深灰色
    border-color: #2c2c2c;
    
    &:hover {
      background-color: #3c3c3c;
      border-color: #3c3c3c;
    }
  }
`;

const DialogueDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [dialogueData, setDialogueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDialogueDetail = async () => {
      try {
        const messageType = type === 'picture' ? 'PICTURE' : 'MESSAGE';
        const response = await chatApi.getDialogueDetail({
          dialogue_id: id,
          message_type: messageType
        });
        setDialogueData(response);
      } catch (error) {
        console.error('Error fetching dialogue detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDialogueDetail();
    }
  }, [id, type]);

  if (loading) {
    return (
      <DialogueContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </DialogueContainer>
    );
  }

  const renderContent = (item, isQuestion) => {
    if (isQuestion) {
      return item.Question;
    }
    
    if (type === 'picture') {
      return <GeneratedImage src={item.Answer} alt="Generated" />;
    }
    
    return (
      <ReactMarkdown>
        {item.Answer}
      </ReactMarkdown>
    );
  };

  const handleContinueChat = () => {
    // 根据类型跳转到对应的对话页面
    navigate(`/${type}`);
  };

  return (
    <>
      <DialogueContainer>
        {dialogueData?.res?.groups.map((item, index) => (
          <React.Fragment key={index}>
            <MessageBubble isQuestion>
              <BubbleContent isQuestion>
                {renderContent(item, true)}
              </BubbleContent>
            </MessageBubble>
            
            <MessageBubble>
              <BubbleContent>
                {renderContent(item, false)}
              </BubbleContent>
            </MessageBubble>
          </React.Fragment>
        ))}
      </DialogueContainer>

      <BottomButtonContainer>
        <StyledButton 
          type="primary"
          icon={<MessageOutlined />}
          onClick={handleContinueChat}
        >
          继续{type === 'picture' ? '生成图片' : '对话'}
        </StyledButton>
      </BottomButtonContainer>
    </>
  );
};

export default DialogueDetail;