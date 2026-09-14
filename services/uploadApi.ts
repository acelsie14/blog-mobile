import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './base';

export const uploadImageRequest = async (
  uri: string,
  type: string,
  name: string,
) => {
  const token = await AsyncStorage.getItem('token');

  const formData = new FormData();
  formData.append('image', {
    uri,
    type,
    name,
  } as any);

  const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // ⚠️ do NOT set Content-Type — the runtime adds the multipart boundary
    },
  });

  return response.data;
};
