import axios from 'axios';
import {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/types';
import { API_BASE_URL, getAuthHeaders } from './base';

//Auth requests
export const loginRequest = async (payload: LoginPayload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const registerRequest = async (payload: RegisterPayload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/apply`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};
export const getProfileRequest = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/users/profile`, {
    headers,
  });
  return response.data;
};

export const updateProfileRequest = async (payload: UpdateProfilePayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${API_BASE_URL}/users/profile`, payload, {
    headers,
  });

  return response.data;
};

export const changePasswordRequest = async (payload: ChangePasswordPayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(
    `${API_BASE_URL}/users/profile/password`,
    payload,
    {
      headers,
    },
  );
  return response.data;
};
export const deleteAccountRequest = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/users/profile`, {
    headers,
  });
  return response.data;
};
