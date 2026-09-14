import { ApiResult, UploadContextType } from '@/types';
import { createContext, useContext } from 'react';
import * as uploadApi from '@/services/uploadApi';

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider = ({ children }: { children: React.ReactNode }) => {
  const uploadImage = async (
    uri: string,
    type: string,
    name: string,
  ): Promise<ApiResult<string>> => {
    try {
      const data = await uploadApi.uploadImageRequest(uri, type, name);
      return { success: true, data: data.url };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to upload image',
      };
    }
  };

  return (
    <UploadContext.Provider value={{ uploadImage }}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) throw new Error('useUpload must be used within UploadProvider');
  return context;
};
