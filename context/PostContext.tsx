import {
  Post,
  PostContextType,
  PaginatedApiResult,
  CreatePostPayload,
  UpdatePostPayload,
  Bookmark,
  GetPostsParams,
  GetBookmarkParams,
  ApiResult,
} from '@/types';
import { createContext, useContext } from 'react';
import * as postApi from '@/services/postApi';

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const getPosts = async (
    params: GetPostsParams = {},
  ): Promise<PaginatedApiResult<Post[]>> => {
    try {
      const data = await postApi.getPostsRequest(params);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const getPost = async (id: string): Promise<ApiResult<Post>> => {
    try {
      const data = await postApi.getPostRequest(id);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const createPost = async (
    payload: CreatePostPayload,
  ): Promise<ApiResult<Post>> => {
    try {
      const data = await postApi.createPostRequest(payload);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const updatePost = async (
    id: string,
    payload: UpdatePostPayload,
  ): Promise<ApiResult<Post>> => {
    try {
      const data = await postApi.updatePostRequest(id, payload);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const deletePost = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await postApi.deletePostRequest(id);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const publishPost = async (id: string): Promise<ApiResult<Post>> => {
    try {
      const data = await postApi.publishPostRequest(id);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const unpublishPost = async (id: string): Promise<ApiResult<Post>> => {
    try {
      const data = await postApi.unpublishPostRequest(id);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const likePost = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await postApi.likePostRequest(id);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const unlikePost = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await postApi.unlikePostRequest(id);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const bookmarkPost = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await postApi.bookmarkPostRequest(id);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const unbookmarkPost = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await postApi.unbookmarkPostRequest(id);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };

  const getBookmarks = async (
    params: GetBookmarkParams = {},
  ): Promise<PaginatedApiResult<Bookmark[]>> => {
    try {
      const data = await postApi.getBookmarksRequest(params);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch posts',
      };
    }
  };
  return (
    <PostContext.Provider
      value={{
        getPosts,
        getPost,
        createPost,
        updatePost,
        deletePost,
        publishPost,
        unpublishPost,
        likePost,
        unlikePost,
        bookmarkPost,
        unbookmarkPost,
        getBookmarks,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);

  if (!context) throw new Error('usePost must be used within PostProvider');

  return context;
};
