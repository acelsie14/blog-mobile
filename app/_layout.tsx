import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { PostProvider } from '@/context/PostContext';
import { CommentProvider } from '@/context/CommentContext';
import { AdminProvider } from '@/context/AdminContext';
import { CategoryTagProvider } from '@/context/CategoryTagContext';
import { UploadProvider } from '@/context/UploadContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PostProvider>
        <CommentProvider>
          <AdminProvider>
            <CategoryTagProvider>
              <UploadProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  {/* Expo Router auto-discovers files in app/ — no need to list them */}
                </Stack>
              </UploadProvider>
            </CategoryTagProvider>
          </AdminProvider>
        </CommentProvider>
      </PostProvider>
    </AuthProvider>
  );
}
