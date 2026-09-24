import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '@/context/AdminContext';
import { Colors } from '@/utils/colors';
import { User } from '@/types';
import UserEditModal from '@/components/UserEditModal';

type FilterKey = 'all' | 'editor' | 'admin' | 'inactive';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'editor', label: 'Editors' },
  { key: 'admin', label: 'Admins' },
  { key: 'inactive', label: 'Inactive' },
];

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [topBanner, setTopBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { getAllUsers } = useAdmin();

  const bannerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
    };
  }, []);

  const showTopBanner = (type: 'success' | 'error', message: string) => {
    setTopBanner({ type, message });
    if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
    bannerTimeout.current = setTimeout(() => setTopBanner(null), 3000);
  };

  const loadUsers = useCallback(async () => {
    try {
      const res = await getAllUsers({});
      if (res.success) {
        setUsers(res.data ?? []);
        setError('');
      } else {
        setError(res.message ?? 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filteredUsers = users.filter((u) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'editor') return u.role === 'editor';
    if (activeFilter === 'admin') return u.role === 'admin';
    if (activeFilter === 'inactive') return !u.isActive;
    return true;
  });

  const handleRowPress = (user: User) => {
    if (user.role === 'editor') {
      setSelectedUser(user);
    }
  };

  const handleUpdated = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    setSelectedUser(updated);
    showTopBanner('success', 'User updated successfully');
  };

  const handleDeleted = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u._id !== userId));
    setSelectedUser(null);
    showTopBanner('success', 'User deleted successfully');
  };

  const renderItem = ({ item }: { item: User }) => {
    const tappable = item.role === 'editor';

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={tappable ? 0.7 : 1}
        onPress={() => handleRowPress(item)}
        disabled={!tappable}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{item.username}</Text>
          <Text style={styles.rowEmail} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <View style={styles.rowRight}>
          <View
            style={[
              styles.roleBadge,
              item.role === 'admin' && styles.roleBadgeAdmin,
              item.role === 'editor' && styles.roleBadgeEditor,
            ]}
          >
            <Text style={styles.roleBadgeText}>{item.role}</Text>
          </View>
          <View
            style={[
              styles.dot,
              item.isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && users.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.subtitle}>
          {filteredUsers.length} of {users.length} shown
        </Text>
      </View>

      {/* Filter chips */}
      <View style={styles.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Top banner */}
      {topBanner ? (
        <View
          style={[
            styles.banner,
            topBanner.type === 'success'
              ? styles.successBanner
              : styles.errorBanner,
          ]}
        >
          <Ionicons
            name={
              topBanner.type === 'success' ? 'checkmark-circle' : 'alert-circle'
            }
            size={20}
            color={
              topBanner.type === 'success' ? Colors.success : Colors.danger
            }
          />
          <Text
            style={[
              styles.bannerText,
              {
                color:
                  topBanner.type === 'success' ? Colors.success : Colors.danger,
              },
            ]}
          >
            {topBanner.message}
          </Text>
        </View>
      ) : null}

      {/* List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No users match this filter</Text>
          </View>
        }
      />

      {/* Edit modal — keyed by user id so it remounts with fresh state per user */}
      <UserEditModal
        key={selectedUser?._id ?? 'closed'}
        visible={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </SafeAreaView>
  );
};

export default Users;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },

  /* Chips */
  chipsWrap: { paddingVertical: 12 },
  chipsContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.textOnPrimary },

  /* Banner */
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  successBanner: { backgroundColor: Colors.successBg },
  errorBanner: { backgroundColor: Colors.dangerBg },
  bannerText: { flex: 1, fontSize: 14, fontWeight: '600' },

  /* List */
  listContent: { padding: 20, paddingTop: 4, flexGrow: 1 },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    // FIX: was Colors.textOnPrimary (white) — use light purple tint
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  rowEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    // FIX: was Colors.textOnPrimary (white) — use light purple tint
    backgroundColor: Colors.primaryLight,
  },
  roleBadgeAdmin: { backgroundColor: Colors.warningBg },
  roleBadgeEditor: { backgroundColor: Colors.successBg },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.success },
  dotInactive: { backgroundColor: Colors.textMuted },

  /* Empty & error */
  emptyText: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  errorText: {
    fontSize: 15,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});
