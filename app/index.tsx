import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  // If user is logged in → go to tabs
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // If no user → go to login
  return <Redirect href="/auth/login" />;
}
