import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/types';

const API_BASE_URL = 'https://blog-backend-wmpk.onrender.com/api';

//Auth requests
export const loginRequest = async (payload: LoginPayload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const registerRequest = async (payload: RegisterPayload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/apply`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const getProfileRequest = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateProfileRequest = async (payload: UpdateProfilePayload) => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.put(`${API_BASE_URL}/users/profile`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const changePasswordRequest = async (payload: ChangePasswordPayload) => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.put(
    `${API_BASE_URL}/users/profile/password`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
export const deleteAccountRequest = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.delete(`${API_BASE_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
