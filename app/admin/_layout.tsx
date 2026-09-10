import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const AdminLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user || user?.role !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Admin Dashboard', headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ title: 'Pending Applications', headerShown: false }}
      />
    </Stack>
  );
};

export default AdminLayout;
