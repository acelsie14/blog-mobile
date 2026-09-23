import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '@/context/AdminContext';
import { Colors } from '@/utils/colors';
import { User } from '@/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const AMBER = '#F59E0B';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const InfoLine = ({ icon, text }: { icon: IconName; text?: string }) => {
  if (!text) return null;
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={16} color={Colors.textSecondary} />
      <Text style={styles.infoText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

const Pending = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [acted, setActed] = useState<Record<string, 'approved' | 'rejected'>>(
    {},
  );
  const [modalQueue, setModalQueue] = useState<
    { title: string; message: string; variant: 'success' | 'error' }[]
  >([]);
  const { getPendingUsers, approveUser, rejectUser } = useAdmin();

  const loadPending = useCallback(async () => {
    try {
      const res = await getPendingUsers();
      if (res.success) {
        setUsers(res.data ?? []);
        setError('');
        setActed({}); // clear acted badges on refresh
      } else {
        setError(res.message ?? 'Failed to load pending users');
      }
    } finally {
      setLoading(false);
    }
  }, [getPendingUsers]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPending();
    setRefreshing(false);
  };

  const runApprove = async (user: User) => {
    setBusy((prev) => ({ ...prev, [user._id]: true }));

    try {
      const res = await approveUser(user._id);
      if (res.success) {
        setActed((prev) => ({ ...prev, [user._id]: 'approved' }));
        setModalQueue((prev) => [
          ...prev,
          {
            title: 'User approved',
            message: `${user.username} has been approved. A verification email has been sent.`,
            variant: 'success',
          },
        ]);
      } else {
        setModalQueue((prev) => [
          ...prev,
          {
            title: 'Approval failed',
            message: res.message ?? 'Something went wrong.',
            variant: 'error',
          },
        ]);
      }
    } finally {
      setBusy((prev) => {
        const next = { ...prev };
        delete next[user._id];
        return next;
      });
    }
  };

  const handleApprove = (user: User) => {
    Alert.alert(
      'Approve application',
      `Approve ${user.username}? They will receive a verification email.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => runApprove(user) },
      ],
    );
  };

  const runReject = async (user: User) => {
    setBusy((prev) => ({ ...prev, [user._id]: true }));

    try {
      const res = await rejectUser(user._id);
      if (res.success) {
        setActed((prev) => ({ ...prev, [user._id]: 'rejected' }));
        setModalQueue((prev) => [
          ...prev,
          {
            title: 'User rejected',
            message: `${user.username} has been rejected.`,
            variant: 'success',
          },
        ]);
      } else {
        setModalQueue((prev) => [
          ...prev,
          {
            title: 'Rejection failed',
            message: res.message ?? 'Something went wrong.',
            variant: 'error',
          },
        ]);
      }
    } finally {
      setBusy((prev) => {
        const next = { ...prev };
        delete next[user._id];
        return next;
      });
    }
  };

  const handleReject = (user: User) => {
    Alert.alert(
      'Reject application',
      `Reject and delete ${user.username}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => runReject(user),
        },
      ],
    );
  };

  /* ---------------------------- Card ---------------------------- */

  const renderItem = ({ item }: { item: User }) => {
    const isBusy = busy[item._id] === true;
    const action = acted[item._id];
    const applied = formatDate(item.createdAt);
    const initial = (item.username?.[0] ?? '?').toUpperCase();

    return (
      <View style={styles.card}>
        {/* Identity row */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.username} numberOfLines={1}>
              {item.username}
            </Text>
            {!!applied && <Text style={styles.date}>Applied {applied}</Text>}
          </View>
          {!action && !isBusy && (
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Pending</Text>
            </View>
          )}
        </View>

        {/* Contact details */}
        <View style={styles.infoBlock}>
          <InfoLine icon="mail-outline" text={item.email} />
          <InfoLine icon="call-outline" text={item.phoneNumber} />
        </View>

        {/* Bio */}
        {item.bio ? (
          <View style={styles.bioBox}>
            <Text style={styles.bio}>{item.bio}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          {isBusy ? (
            <View style={styles.busyRow}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : action === 'approved' ? (
            <View style={[styles.result, styles.resultApproved]}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.resultText}>Approved</Text>
            </View>
          ) : action === 'rejected' ? (
            <View style={[styles.result, styles.resultRejected]}>
              <Ionicons name="close-circle" size={20} color={Colors.danger} />
              <Text style={styles.resultText}>Rejected</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnReject]}
                onPress={() => handleReject(item)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Reject ${item.username}`}
              >
                <Ionicons name="close" size={18} color={Colors.danger} />
                <Text style={styles.btnRejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnApprove]}
                onPress={() => handleApprove(item)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Approve ${item.username}`}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={Colors.textOnPrimary}
                />
                <Text style={styles.btnApproveText}>Approve</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  /* ------------------------ Loading / error ------------------------ */

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && users.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.center}>
          <View
            style={[styles.stateIcon, { backgroundColor: Colors.dangerBg }]}
          >
            <Ionicons
              name="cloud-offline-outline"
              size={34}
              color={Colors.danger}
            />
          </View>
          <Text style={styles.stateTitle}>Couldn&apos;t load applications</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadPending}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color={Colors.textOnPrimary} />
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------------------- Main ---------------------------- */

  const current = modalQueue[0];
  const waiting = users.filter((u) => !acted[u._id]).length;

  const Header = users.length > 0 && (
    <View style={styles.summary}>
      <View style={styles.summaryIcon}>
        <Ionicons name="hourglass-outline" size={22} color={AMBER} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.summaryTitle}>
          {waiting} {waiting === 1 ? 'application' : 'applications'} waiting
        </Text>
        <Text style={styles.summarySub}>
          Review each request and approve or reject
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={Header || null}
        ListEmptyComponent={
          <View style={styles.center}>
            <View
              style={[styles.stateIcon, { backgroundColor: Colors.successBg }]}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={34}
                color={Colors.success}
              />
            </View>
            <Text style={styles.stateTitle}>You&apos;re all caught up</Text>
            <Text style={styles.stateText}>
              There are no pending applications right now. Pull down to refresh.
            </Text>
          </View>
        }
      />

      <FeedbackModal
        visible={!!current}
        title={current?.title ?? ''}
        message={current?.message ?? ''}
        variant={current?.variant ?? 'success'}
        onClose={() => setModalQueue((prev) => prev.slice(1))}
      />
    </SafeAreaView>
  );
};

/* ------------------------------------------------------------------ */
/* Feedback modal                                                      */
/* ------------------------------------------------------------------ */

const FeedbackModal = ({
  visible,
  title,
  message,
  variant,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error';
  onClose: () => void;
}) => {
  const isSuccess = variant === 'success';
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard}>
          <View
            style={[
              styles.modalIconWrap,
              {
                backgroundColor: isSuccess ? Colors.successBg : Colors.dangerBg,
              },
            ]}
          >
            <Ionicons
              name={isSuccess ? 'checkmark' : 'close'}
              size={32}
              color={isSuccess ? Colors.success : Colors.danger}
            />
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.modalButtonText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default Pending;

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const RADIUS = 20;

const cardShadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  /* Shells */
  safe: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  listContent: { padding: 20, paddingBottom: 40, flexGrow: 1 },

  /* Summary header */
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: AMBER,
    ...cardShadow,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: AMBER + '1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summarySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  /* Card */
  card: {
    backgroundColor: Colors.surface,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 14,
    ...cardShadow,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary + '1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 19, fontWeight: '700', color: Colors.primary },
  cardHeaderText: { flex: 1, marginLeft: 12 },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  date: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AMBER + '26',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginLeft: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AMBER,
    marginRight: 6,
  },
  statusText: { fontSize: 12, fontWeight: '700', color: '#B45309' },

  /* Details */
  infoBlock: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(120,120,120,0.25)',
    gap: 8,
  },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { flex: 1, fontSize: 15, color: Colors.textSecondary },

  bioBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },

  /* Actions */
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
    minHeight: 48, // keeps card height stable when buttons swap for spinner/result
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 14,
  },
  btnApprove: { backgroundColor: Colors.primary },
  btnApproveText: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  btnReject: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  btnRejectText: { color: Colors.danger, fontWeight: '700', fontSize: 15 },

  busyRow: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  result: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
  },
  resultApproved: { backgroundColor: Colors.successBg },
  resultRejected: { backgroundColor: Colors.dangerBg },
  resultText: { fontWeight: '700', fontSize: 15, color: Colors.textPrimary },

  /* Empty + error states */
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  stateText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 24,
  },
  retryButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 15,
  },

  /* Feedback modal */
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});
