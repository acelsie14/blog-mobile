import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from './base';
import { CreateCommentPayload, UpdateCommentPayload } from '@/types';

export const getCommentsRequest = async (postId: string) => {
  const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`);
  return response.data;
};

export const createCommentRequest = async (
  postId: string,
  payload: CreateCommentPayload,
) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/posts/${postId}/comments`,
    payload,
    { headers },
  );
  return response.data;
};

export const updateCommentRequest = async (
  id: string,
  payload: UpdateCommentPayload,
) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${API_BASE_URL}/comments/${id}`, payload, {
    headers,
  });
  return response.data;
};

export const deleteCommentRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/comments/${id}`, {
    headers,
  });
  return response.data;
};

export const likeCommentRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/comments/${id}/like`,
    {},
    { headers },
  );
  return response.data;
};

export const unlikeCommentRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/comments/${id}/unlike`, {
    headers,
  });
  return response.data;
};
