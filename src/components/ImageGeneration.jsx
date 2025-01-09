import React, { useState } from 'react';
import { Input, Button, Card, message, Spin } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { chatApi } from '../api/services';

const ImageGenerationContainer = styled.div`
  padding: 20px;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const ImageCard = styled(Card)`
  .ant-card-body {
    padding: 8px;
  }
  
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
`;

const ImageGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请输入图片描述');
      return;
    }

    try {
      setLoading(true);
      const response = await chatApi.generateImage({
        user_id: 'user_test',
        question_about_picture: prompt
      });

      if (response.code === 200 && response.message) {
        setImages(response.message);
        message.success('图片生成成功！');
      } else {
        message.error('图片生成失败');
      }
    } catch (error) {
      message.error('生成图片时出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageGenerationContainer>
      <Input.TextArea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="请描述你想生成的图片..."
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
      <Button
        type="primary"
        icon={<PictureOutlined />}
        onClick={handleGenerate}
        loading={loading}
        style={{ marginTop: 16 }}
      >
        生成图片
      </Button>

      <Spin spinning={loading}>
        <ImageGrid>
          {images.map((image, index) => (
            <ImageCard key={index}>
              <img src={image.url} alt={`Generated ${index + 1}`} />
            </ImageCard>
          ))}
        </ImageGrid>
      </Spin>
    </ImageGenerationContainer>
  );
};

export default ImageGeneration;