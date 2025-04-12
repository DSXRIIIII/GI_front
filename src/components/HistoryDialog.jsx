import React, { useEffect, useState } from 'react';
import { Modal, List, Typography, Spin, Select, Space } from 'antd';
import styled from 'styled-components';
import { chatApi } from '../api/services';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { Option } = Select;

const FilterContainer = styled(Space)`
  margin-bottom: 16px;
  width: 100%;
  display: flex;
  gap: 16px;
`;

const StyledSelect = styled(Select)`
  min-width: 150px;

  .ant-select-selector {
    &:hover {
      border-color: #3c3c3c !important;
    }
  }

  &.ant-select-focused {
    .ant-select-selector {
      border-color: #2c2c2c !important;
      box-shadow: 0 0 0 2px rgba(44, 44, 44, 0.1) !important;
    }
  }
`;

const HistoryContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const HistoryItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const QuestionText = styled(Text)`
  display: block;
  margin-bottom: 4px;
  color: #2c2c2c;
  font-weight: bold;
`;

const AnswerText = styled(Text)`
  display: block;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 500px;
`;

const HistoryDialog = ({ visible, onClose, onSelectDialogue }) => {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [messageType, setMessageType] = useState('MESSAGE');
  const [selectedModel, setSelectedModel] = useState('glm-4-flash');
  const navigate = useNavigate();

  // 消息类型选项
  const messageTypes = [
    { value: 'MESSAGE', label: '文本对话' },
    { value: 'PICTURE', label: '图片生成' }
  ];

  // 根据消息类型定义不同的模型选项
  const chatModelOptions = [
    { value: 'glm-4-flash', label: 'GLM-4-Flash' },
  ];

  const pictureModelOptions = [
    { value: 'glm-4v-plus', label: 'GLM-4V-Plus' }
  ];

  // 根据消息类型获取对应的模型选项
  const getModelOptions = () => {
    return messageType === 'PICTURE' ? pictureModelOptions : chatModelOptions;
  };

  // 当消息类型改变时，重置模型选择
  const handleMessageTypeChange = (newType) => {
    setMessageType(newType);
    // 设置为当前类型下的第一个可用模型
    const availableModels = newType === 'PICTURE' ? pictureModelOptions : chatModelOptions;
    setSelectedModel(availableModels[0].value);
  };

  useEffect(() => {
    if (visible) {
      fetchHistoryData();
    }
  }, [visible, messageType, selectedModel]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const response = await chatApi.getDialogueHistory({
        user_id: localStorage.getItem('user_id'),
        model: selectedModel,
        message_type: messageType
      });

      if (response?.code === 200) {
        const dialogues = response?.groups || [];
        if (Array.isArray(dialogues) && dialogues.length > 0) {
          const sortedData = [...dialogues].sort((a, b) => {
            const levelA = a?.level ?? Number.MAX_SAFE_INTEGER;
            const levelB = b?.level ?? Number.MAX_SAFE_INTEGER;
            return levelA - levelB;
          });
          setHistoryData(sortedData);
        } else {
          setHistoryData([]);
        }
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogueClick = (dialogueId) => {
    // 根据消息类型决定跳转路径
    const type = messageType === 'PICTURE' ? 'picture' : 'chat';
    // 关闭对话框
    onClose();
    // 跳转到对应页面
    navigate(`/${type}/${dialogueId}`);
  };

  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Modal
      title="历史对话记录"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <FilterContainer>
        <StyledSelect
          value={messageType}
          onChange={handleMessageTypeChange}
          placeholder="选择消息类型"
        >
          {messageTypes.map(type => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </StyledSelect>
        
        <StyledSelect
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder="选择模型"
        >
          {getModelOptions().map(model => (
            <Option key={model.value} value={model.value}>
              {model.label}
            </Option>
          ))}
        </StyledSelect>
      </FilterContainer>

      <HistoryContainer>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : (
          historyData.map((item, index) => (
            <HistoryItem 
              key={item.dialogue_id || index}
              onClick={() => handleDialogueClick(item.dialogue_id)}
            >
              <QuestionText>
                {item.dialogues?.[0]?.Question || '无标题对话'}
              </QuestionText>
              <AnswerText>
                {truncateText(item.dialogues?.[0]?.Answer || '无回复内容')}
              </AnswerText>
            </HistoryItem>
          ))
        )}
      </HistoryContainer>
    </Modal>
  );
};

export default HistoryDialog; 