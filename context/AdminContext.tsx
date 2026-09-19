import {
  AdminContextType,
  ApiResult,
  CreateEditorPayload,
  GetAllUsersParams,
  UpdateUserPayload,
  User,
} from '@/types';
import { createContext, useContext } from 'react';
import * as adminApi from '@/services/adminApi';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const getPendingUsers = async (): Promise<ApiResult<User[]>> => {
    try {
      const data = await adminApi.getPendingUsersRequest();
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch pending users',
      };
    }
  };

  const approveUser = async (userId: string): Promise<ApiResult<void>> => {
    try {
      const data = await adminApi.approveUserRequest(userId);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to approve user',
      };
    }
  };

  const rejectUser = async (userId: string): Promise<ApiResult<void>> => {
    try {
      const data = await adminApi.rejectUserRequest(userId);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to reject user',
      };
    }
  };

  const createEditor = async (
    payload: CreateEditorPayload,
  ): Promise<ApiResult<void>> => {
    try {
      const data = await adminApi.createEditorRequest(payload);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create editor',
      };
    }
  };

  const getAllUsers = async (
    params: GetAllUsersParams = {},
  ): Promise<ApiResult<User[]>> => {
    try {
      const data = await adminApi.getAllUsersRequest(params);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch all users',
      };
    }
  };

  const getUser = async (userId: string): Promise<ApiResult<User>> => {
    try {
      const data = await adminApi.getUserRequest(userId);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to get user',
      };
    }
  };

  const updateUser = async (
    userId: string,
    payload: UpdateUserPayload,
  ): Promise<ApiResult<User>> => {
    try {
      const data = await adminApi.updateUserRequest(userId, payload);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update user',
      };
    }
  };

  const deleteUser = async (userId: string): Promise<ApiResult<void>> => {
    try {
      const data = await adminApi.deleteUserRequest(userId);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete usert',
      };
    }
  };

  const deactivateUser = async (userId: string): Promise<ApiResult<void>> => {
    try {
      const data = await adminApi.deactivateUserRequest(userId);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to deactivate user',
      };
    }
  };

  const activateUser = async (userId: string): Promise<ApiResult<void>> => {
    try {
      const data = await adminApi.activateUserRequest(userId);
      return data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to activate user',
      };
    }
  };
  return (
    <AdminContext.Provider
      value={{
        getPendingUsers,
        approveUser,
        rejectUser,
        createEditor,
        getAllUsers,
        getUser,
        updateUser,
        deleteUser,
        deactivateUser,
        activateUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);

  if (!context) throw new Error('useAdmin must be used within AdminProvider');

  return context;
};
