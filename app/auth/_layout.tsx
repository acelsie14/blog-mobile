import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const AuthLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ title: 'Login', headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ title: 'Register', headerShown: false }}
      />
    </Stack>
  );
};

export default AuthLayout;
