import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { useCategoryTag } from '@/context/CategoryTagContext';
import { Colors } from '@/utils/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Fixed accents so each metric is recognisable at a glance
const ACCENT = {
  pending: '#F59E0B',
  users: '#3B82F6',
  categories: '#10B981',
  tags: '#8B5CF6',
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const IconBadge = ({
  name,
  color,
  size = 44,
}: {
  name: IconName;
  color: string;
  size?: number;
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 3,
      backgroundColor: color + '1F', // ~12% tint
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Ionicons name={name} size={size * 0.5} color={color} />
  </View>
);

// Wide card for the metric that needs action first
const PendingCard = ({
  value,
  failed,
  onPress,
}: {
  value: number;
  failed: boolean;
  onPress: () => void;
}) => {
  const hasPending = !failed && value > 0;
  return (
    <TouchableOpacity
      style={styles.pendingCard}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Pending approvals: ${failed ? 'unavailable' : value}. Tap to review.`}
    >
      <View style={styles.pendingTop}>
        <IconBadge name="hourglass-outline" color={ACCENT.pending} size={48} />
        {hasPending && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>Action needed</Text>
          </View>
        )}
      </View>

      <Text style={styles.pendingValue}>{failed ? '—' : value}</Text>
      <Text style={styles.pendingLabel}>Pending approvals</Text>

      <View style={styles.pendingFooter}>
        <Text style={styles.pendingHint}>
          {failed
            ? "Couldn't load. Pull down to retry."
            : hasPending
              ? 'New accounts are waiting for your review'
              : 'Nothing waiting for review'}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const StatTile = ({
  label,
  value,
  failed,
  icon,
  color,
  onPress,
}: {
  label: string;
  value: number;
  failed: boolean;
  icon: IconName;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.tile}
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityRole="button"
    accessibilityLabel={`${label}: ${failed ? 'unavailable' : value}. Tap to view.`}
  >
    <IconBadge name={icon} color={color} size={38} />
    <Text style={styles.tileValue}>{failed ? '—' : value}</Text>
    <Text style={styles.tileLabel} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ActionRow = ({
  icon,
  title,
  subtitle,
  onPress,
  color = Colors.primary,
  danger = false,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  danger?: boolean;
}) => {
  const tint = danger ? Colors.danger : color;
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <IconBadge name={icon} color={tint} size={42} />
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && { color: Colors.danger }]}>
          {title}
        </Text>
        {!!subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {!danger && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

      setLastUpdated(new Date());
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

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const initial = (user?.username?.[0] ?? 'A').toUpperCase();

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [],
  );

  const updatedLabel = lastUpdated
    ? `Updated ${lastUpdated.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })}`
    : '';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.greeting} numberOfLines={1}>
              Hello, {user?.username}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          {!!updatedLabel && (
            <Text style={styles.sectionMeta}>{updatedLabel}</Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            <PendingCard
              value={counts.pending}
              failed={failed.pending}
              onPress={() => router.push('/(admin)/pending')}
            />

            <View style={styles.tileRow}>
              <StatTile
                label="Users"
                value={counts.users}
                failed={failed.users}
                icon="people-outline"
                color={ACCENT.users}
                onPress={() => router.push('/(admin)/users')}
              />
              <StatTile
                label="Categories"
                value={counts.categories}
                failed={failed.categories}
                icon="grid-outline"
                color={ACCENT.categories}
                onPress={() => router.push('/(admin)/categories')}
              />
              <StatTile
                label="Tags"
                value={counts.tags}
                failed={failed.tags}
                icon="pricetags-outline"
                color={ACCENT.tags}
                onPress={() => router.push('/(admin)/tags')}
              />
            </View>
          </>
        )}

        {/* Quick actions */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        <View style={styles.group}>
          <ActionRow
            icon="person-add-outline"
            title="Create editor"
            subtitle="Add a new editor account"
            onPress={() => router.push('/(admin)/create-editor')}
          />
        </View>

        {/* Account */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>

        <View style={styles.group}>
          <ActionRow
            icon="log-out-outline"
            title="Log out"
            onPress={confirmLogout}
            danger
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const CARD_RADIUS = 20;

const cardShadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },

  /* Section headings */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionMeta: { fontSize: 13, color: Colors.textSecondary },

  loader: { height: 240, alignItems: 'center', justifyContent: 'center' },

  /* Pending (featured) card */
  pendingCard: {
    backgroundColor: Colors.surface,
    borderRadius: CARD_RADIUS,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT.pending,
    ...cardShadow,
  },
  pendingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    backgroundColor: ACCENT.pending + '26',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  pendingValue: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginTop: 16,
  },
  pendingLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  pendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(120,120,120,0.25)',
  },
  pendingHint: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },

  /* Stat tiles */
  tileRow: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: CARD_RADIUS,
    paddingVertical: 18,
    paddingHorizontal: 14,
    ...cardShadow,
  },
  tileValue: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 14,
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },

  /* Action rows */
  group: {
    backgroundColor: Colors.surface,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    ...cardShadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowText: { flex: 1, marginLeft: 14 },
  rowTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  rowSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
