import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from './base';
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  UpdateTagPayload,
} from '@/types';

export const getCategoriesRequest = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/categories`, { headers });

  return response.data;
};

export const getCategoryBySlugRequest = async (slug: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/categories/${slug}`, {
    headers,
  });

  return response.data;
};

export const createCategoryRequest = async (payload: CreateCategoryPayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_BASE_URL}/categories`, payload, {
    headers,
  });

  return response.data;
};

export const updateCategoryRequest = async (
  id: string,
  payload: UpdateCategoryPayload,
) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(
    `${API_BASE_URL}/categories/${id}`,
    payload,
    { headers },
  );

  return response.data;
};

export const deleteCategoryRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/categories/${id}`, {
    headers,
  });

  return response.data;
};

export const getTagsRequest = async () => {
  const response = await axios.get(`${API_BASE_URL}/tags`);

  return response.data;
};

export const getTagBySlugRequest = async (slug: string) => {
  const response = await axios.get(`${API_BASE_URL}/tags/${slug}`);

  return response.data;
};

export const updateTagRequest = async (
  id: string,
  payload: UpdateTagPayload,
) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${API_BASE_URL}/tags/${id}`, payload, {
    headers,
  });

  return response.data;
};

export const deleteTagRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/tags/${id}`, {
    headers,
  });

  return response.data;
};
