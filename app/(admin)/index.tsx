import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { useCategoryTag } from '@/context/CategoryTagContext';
import { Colors } from '@/utils/colors';

// Stat card is now pressable and routes via the onPress handler
const StatCard = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number | string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`${label}: ${value}. Tap to view.`}
  >
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    pending: 0,
    users: 0,
    categories: 0,
    tags: 0,
  });

  const [failed, setFailed] = useState({
    pending: false,
    users: false,
    categories: false,
    tags: false,
  });

  const [loading, setLoading] = useState(true); // big centered spinner
  const [refreshing, setRefreshing] = useState(false); // small pull-to-refresh spinner

  const { user, logout } = useAuth();
  const { getPendingUsers, getAllUsers } = useAdmin();
  const { getCategories, getTags } = useCategoryTag();

  const loadCounts = useCallback(async () => {
    try {
      const [pendingRes, usersRes, catsRes, tagsRes] = await Promise.all([
        getPendingUsers(),
        getAllUsers(),
        getCategories(),
        getTags(),
      ]);

      setCounts({
        pending: pendingRes.success ? (pendingRes.data?.length ?? 0) : 0,
        users: usersRes.success ? (usersRes.data?.length ?? 0) : 0,
        categories: catsRes.success ? (catsRes.data?.length ?? 0) : 0,
        tags: tagsRes.success ? (tagsRes.data?.length ?? 0) : 0,
      });

      setFailed({
        pending: !pendingRes.success,
        users: !usersRes.success,
        categories: !catsRes.success,
        tags: !tagsRes.success,
      });
    } finally {
      setLoading(false);
    }
  }, [getPendingUsers, getAllUsers, getCategories, getTags]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCounts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ScrollView + RefreshControl = pull-to-refresh */}
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6C63FF"
          />
        }
      >
        {/* Header */}
        <Text style={styles.greeting}>Welcome, {user?.username}</Text>
        <Text style={styles.subtitle}>Admin Dashboard</Text>

        {/* Stats grid (2×2) — each card routes to its screen */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#6C63FF"
            style={{ marginTop: 60 }}
          />
        ) : (
          <View style={styles.statsGrid}>
            <StatCard
              label="Pending"
              value={failed.pending ? '—' : counts.pending}
              onPress={() => router.push('/(admin)/pending')}
            />
            <StatCard
              label="Users"
              value={failed.users ? '—' : counts.users}
              onPress={() => router.push('/(admin)/users')}
            />
            <StatCard
              label="Categories"
              value={failed.categories ? '—' : counts.categories}
              onPress={() => router.push('/(admin)/categories')}
            />
            <StatCard
              label="Tags"
              value={failed.tags ? '—' : counts.tags}
              onPress={() => router.push('/(admin)/tags')}
            />
          </View>
        )}

        {/* Create Editor */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(admin)/create-editor')}
        >
          <Text style={styles.navButtonText}>Create Editor</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.navButton, styles.logoutButton]}
          onPress={logout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, paddingBottom: 48 },
  greeting: { fontSize: 30, fontWeight: '700', color: Colors.textPrimary },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    minHeight: 150,
    backgroundColor: Colors.surface,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 44, fontWeight: '700', color: Colors.primary },
  statLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  navButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: { fontSize: 18, fontWeight: '600', color: '#333' },
  logoutButton: { backgroundColor: Colors.textOnDanger, marginTop: 8 },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.danger,
    textAlign: 'center',
    flex: 1,
  },
});
