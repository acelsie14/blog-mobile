import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from './base';
import {
  CreateEditorPayload,
  GetAllUsersParams,
  UpdateUserPayload,
} from '@/types';

export const getPendingUsersRequest = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/admin/pending`, {
    headers,
  });
  return response.data;
};

export const getAllUsersRequest = async (params: GetAllUsersParams = {}) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/admin/users`, {
    params,
    headers,
  });
  return response.data;
};

export const approveUserRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/admin/approve/${id}`,
    {},
    {
      headers,
    },
  );

  return response.data;
};

export const rejectUserRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/admin/reject/${id}`, {
    headers,
  });

  return response.data;
};

export const createEditorRequest = async (payload: CreateEditorPayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/admin/create-editor`,
    payload,
    { headers },
  );

  return response.data;
};

export const getUserRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/admin/users/${id}`, {
    headers,
  });

  return response.data;
};

export const updateUserRequest = async (
  id: string,
  payload: UpdateUserPayload,
) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(
    `${API_BASE_URL}/admin/users/${id}`,
    payload,
    {
      headers,
    },
  );

  return response.data;
};

export const deleteUserRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
    headers,
  });

  return response.data;
};

export const deactivateUserRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/admin/users/${id}/deactivate`,
    {},
    { headers },
  );

  return response.data;
};

export const activateUserRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/admin/users/${id}/activate`,
    {},
    { headers },
  );

  return response.data;
};
