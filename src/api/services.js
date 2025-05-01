import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8091';

export const chatApi = {
  sendMessage: async (data, onChunk) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/zp/question/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(data),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 将新的数据添加到缓冲区
        buffer += decoder.decode(value, { stream: true });

        // 处理缓冲区中的完整事件
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // 保留最后一个不完整的事件

        for (const event of events) {
          if (!event.trim()) continue;

          // 解析事件数据
          const lines = event.split('\n');
          const eventType = lines[0].replace('event:', '');
          const data = lines[1].replace('data:', '');

          if (eventType === 'message') {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.code === 200) {
                onChunk(parsedData.message);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  },
  generateImage: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/zp/question/picture`, data);
    return response.data;
  },
  getDialogueHistory: async (params) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/dialogue/history`, params);
      return response.data;
    } catch (error) {
      console.error('Error fetching dialogue history:', error);
      throw error;
    }
  },
  getDialogueDetail: async (params) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/dialogue/all`, params);
      return response.data;
    } catch (error) {
      console.error('Error fetching dialogue detail:', error);
      throw error;
    }
  },
};

export const imageApi = {
  generateImage: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/zp/question/picture`, data);
    return response.data;
  }
};

export const userApi = {
  register: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/user/register`, data);
    return response.data;
  },
  login: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/user/login`, data);
    if (response.data.code === 200) {
      localStorage.setItem('user_id', response.data.user_id);
    } 
    return response.data;
  },
  getUserInfo: async () => {
    const response = await axios.post(`${API_BASE_URL}/user/info`, {
      user_id: localStorage.getItem('user_id')
    });
    return response.data;
  },
  updateUserInfo: async (data) => {
    const processedData = {
      ...data,
      label: data.label ? data.label.split(',').map(item => item.trim()) : []
    };

    const response = await axios.post(`${API_BASE_URL}/user/update`, processedData);
    return response.data;
  },
  uploadAvatar: async (formData) => {
    const uploadResponse = await axios.post(`${API_BASE_URL}/user/upload/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    if (uploadResponse.data.code === 200) {
      const updateResponse = await axios.post(`${API_BASE_URL}/user/update`, {
        user_id: localStorage.getItem('user_id'),
        avatar_url: uploadResponse.data.picture_url
      });
      
      return {
        upload: uploadResponse.data,
        update: updateResponse.data
      };
    }

    return {
      upload: uploadResponse.data
    };
  },
  sendEmailCode: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/user/login/email`, {
      email: data.email
    });
    return response.data;
  },
  emailLogin: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/user/login/verify/code`, {
      email: data.email,
      code: data.code
    });
    if (response.data.code === 200) {
      localStorage.setItem('user_id', response.data.user_id);
    }
    return response.data;
  },
  checkEmail: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/user/email/verify`, {
      email: data.email
    });
    return response.data;
  }
};

export const adminApi = {
  getAllRecords: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/admin/all`);
    return response.data;
  }
};

export const bilibiliApi = {
  getHotspot: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/bilibili/hotspot`);
    return response.data;
  }
};

export const douyinApi = {
  getHotspot: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/douyin/hotspot`);
    return response.data;
  }
}; 