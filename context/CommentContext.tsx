import {
  ApiResult,
  Comment,
  CommentContextType,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '@/types';
import { createContext, useContext } from 'react';
import * as commentApi from '@/services/commentApi';

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const CommentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const getComments = async (postId: string): Promise<ApiResult<Comment[]>> => {
    try {
      const data = await commentApi.getCommentsRequest(postId);

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

  const createComment = async (
    postId: string,
    payload: CreateCommentPayload,
  ): Promise<ApiResult<Comment>> => {
    try {
      const data = await commentApi.createCommentRequest(postId, payload);

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

  const updateComment = async (
    id: string,
    payload: UpdateCommentPayload,
  ): Promise<ApiResult<Comment>> => {
    try {
      const data = await commentApi.updateCommentRequest(id, payload);
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

  const deleteComment = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await commentApi.deleteCommentRequest(id);
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

  const likeComment = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await commentApi.likeCommentRequest(id);
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

  const unlikeComment = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await commentApi.unlikeCommentRequest(id);
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
    <CommentContext.Provider
      value={{
        getComments,
        createComment,
        updateComment,
        deleteComment,
        likeComment,
        unlikeComment,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useComment = () => {
  const context = useContext(CommentContext);

  if (!context)
    throw new Error('useComment must be used within CommentProvider');

  return context;
};
