import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ApiResult,
  AuthContextType,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/types';
import * as api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const isAuthenticated = !!user && !!token;

  const login = async (payload: LoginPayload): Promise<ApiResult<void>> => {
    try {
      const data = await api.loginRequest(payload);

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error: any) {
      console.log(error);
      return {
        success: false,
        message:
          error?.response?.data?.message || error?.message || 'Login failed',
      };
    }
  };

  const register = async (
    payload: RegisterPayload,
  ): Promise<ApiResult<void>> => {
    try {
      await api.registerRequest(payload);

      return { success: true };
    } catch (error: any) {
      console.log(error);
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Registration failed',
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error: any) {
      // if storage is corrupted, clear it
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);
  const updateProfile = async (
    payload: UpdateProfilePayload,
  ): Promise<ApiResult<User>> => {
    try {
      const data = await api.updateProfileRequest(payload);
      const updatedUser = data.data;

      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      return { success: true, data: updatedUser };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Profile update failed',
      };
    }
  };

  const changePassword = async (
    payload: ChangePasswordPayload,
  ): Promise<ApiResult<void>> => {
    try {
      await api.changePasswordRequest(payload);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Password change failed',
      };
    }
  };

  const deleteAccount = async (): Promise<ApiResult<void>> => {
    try {
      await api.deleteAccountRequest();
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setToken(null);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Error deleting user',
      };
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
        updateProfile,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used with AuthProvider');
  return context;
};
