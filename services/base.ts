import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://blog-backend-wmpk.onrender.com/api';

export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};
