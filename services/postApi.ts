import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from './base';
import {
  CreatePostPayload,
  GetBookmarkParams,
  GetPostsParams,
  UpdatePostPayload,
} from '@/types';

export const getPostsRequest = async (params: GetPostsParams = {}) => {
  const response = await axios.get(`${API_BASE_URL}/posts`, {
    params, // axios builds the ?key=value&... string for you, only including defined keys
  });
  return response.data;
};

export const getPostRequest = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
  return response.data;
};

export const createPostRequest = async (payload: CreatePostPayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_BASE_URL}/posts`, payload, {
    headers,
  });

  return response.data;
};

export const updatePostRequest = async (
  id: string,
  payload: UpdatePostPayload,
) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${API_BASE_URL}/posts/${id}`, payload, {
    headers,
  });

  return response.data;
};

export const deletePostRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/posts/${id}`, {
    headers,
  });

  return response.data;
};

export const publishPostRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/posts/${id}/publish`,
    {},
    { headers },
  );

  return response.data;
};

export const unpublishPostRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/posts/${id}/unpublish`,
    {},
    { headers },
  );

  return response.data;
};

export const likePostRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/posts/${id}/like`,
    {},
    { headers },
  );

  return response.data;
};

export const unlikePostRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/posts/${id}/unlike`, {
    headers,
  });

  return response.data;
};

export const bookmarkPostRequest = async (postId: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/posts/${postId}/bookmark`,
    {},
    { headers },
  );

  return response.data;
};

export const unbookmarkPostRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(
    `${API_BASE_URL}/posts/${id}/unbookmark`,
    { headers },
  );

  return response.data;
};

export const getBookmarksRequest = async (params: GetBookmarkParams = {}) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/users/me/bookmarks`, {
    params,
    headers,
  });
  return response.data;
};
