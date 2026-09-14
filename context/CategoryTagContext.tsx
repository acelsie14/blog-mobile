import {
  ApiResult,
  Category,
  CategoryTagContextType,
  CreateCategoryPayload,
  Tag,
  UpdateCategoryPayload,
  UpdateTagPayload,
} from '@/types';
import { createContext, useContext } from 'react';
import * as categoryTagApi from '@/services/categoryTagApi';

const CategoryTagContext = createContext<CategoryTagContextType | undefined>(
  undefined,
);

export const CategoryTagProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const getCategories = async (): Promise<ApiResult<Category[]>> => {
    try {
      const data = await categoryTagApi.getCategoriesRequest();

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch categories',
      };
    }
  };

  const getCategoryBySlug = async (
    slug: string,
  ): Promise<ApiResult<Category>> => {
    try {
      const data = await categoryTagApi.getCategoryBySlugRequest(slug);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch category by slug',
      };
    }
  };

  const createCategory = async (
    payload: CreateCategoryPayload,
  ): Promise<ApiResult<Category>> => {
    try {
      const data = await categoryTagApi.createCategoryRequest(payload);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create category',
      };
    }
  };

  const updateCategory = async (
    id: string,
    payload: UpdateCategoryPayload,
  ): Promise<ApiResult<Category>> => {
    try {
      const data = await categoryTagApi.updateCategoryRequest(id, payload);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update category',
      };
    }
  };

  const deleteCategory = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await categoryTagApi.deleteCategoryRequest(id);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete category',
      };
    }
  };

  const getTags = async (): Promise<ApiResult<Tag[]>> => {
    try {
      const data = await categoryTagApi.getTagsRequest();
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch tags',
      };
    }
  };

  const getTagBySlug = async (slug: string): Promise<ApiResult<Tag>> => {
    try {
      const data = await categoryTagApi.getTagBySlugRequest(slug);

      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch tag by slug',
      };
    }
  };

  const updateTag = async (
    id: string,
    payload: UpdateTagPayload,
  ): Promise<ApiResult<Tag>> => {
    try {
      const data = await categoryTagApi.updateTagRequest(id, payload);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update tag',
      };
    }
  };

  const deleteTag = async (id: string): Promise<ApiResult<void>> => {
    try {
      const data = await categoryTagApi.deleteTagRequest(id);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete tag',
      };
    }
  };
  return (
    <CategoryTagContext.Provider
      value={{
        getCategories,
        getCategoryBySlug,
        createCategory,
        updateCategory,
        deleteCategory,
        getTags,
        getTagBySlug,
        updateTag,
        deleteTag,
      }}
    >
      {children}
    </CategoryTagContext.Provider>
  );
};

export const useCategoryTag = () => {
  const context = useContext(CategoryTagContext);
  if (!context)
    throw new Error('useCategoryTag must be used within CategoryTagProvider');

  return context;
};
