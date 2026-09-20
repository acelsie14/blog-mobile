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

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
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
      {/* STEP 6: ScrollView + RefreshControl = pull-to-refresh */}
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
        {/* STEP 5.1: Header */}
        <Text style={styles.greeting}>Welcome, {user?.username}</Text>
        <Text style={styles.subtitle}>Admin Dashboard</Text>

        {/* STEP 5.2: Stats grid (2×2) */}
        {loading ? (
          // First load → big centered spinner
          <ActivityIndicator
            size="large"
            color="#6C63FF"
            style={{ marginTop: 40 }}
          />
        ) : (
          <View style={styles.statsGrid}>
            {/* Show '—' if the stat failed, otherwise show the number */}
            <StatCard
              label="Pending"
              value={failed.pending ? '—' : counts.pending}
            />
            <StatCard label="Users" value={failed.users ? '—' : counts.users} />
            <StatCard
              label="Categories"
              value={failed.categories ? '—' : counts.categories}
            />
            <StatCard label="Tags" value={failed.tags ? '—' : counts.tags} />
          </View>
        )}

        {/* STEP 5.3: Navigation buttons */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(admin)/pending')}
        >
          <Text style={styles.navButtonText}>Pending Applications</Text>
          {counts.pending > 0 && !failed.pending && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{counts.pending}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(admin)/users')}
        >
          <Text style={styles.navButtonText}>All Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(admin)/create-editor')}
        >
          <Text style={styles.navButtonText}>Create Editor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(admin)/categories')}
        >
          <Text style={styles.navButtonText}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(admin)/tags')}
        >
          <Text style={styles.navButtonText}>Tags</Text>
        </TouchableOpacity>

        {/* STEP 5.4: Logout */}
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
  container: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  navButton: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: 12 },
  logoutButton: { backgroundColor: Colors.textOnDanger, marginTop: 12 },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.danger,
    textAlign: 'center',
    flex: 1,
  },
});
