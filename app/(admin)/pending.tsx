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
// import { router } from 'expo-router';
import { useAdmin } from '@/context/AdminContext';
import { Colors } from '@/utils/colors';
import { User } from '@/types';

const Pending = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<Record<string, boolean>>({}); // stores key value pairs kets are strings and values are booleans
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
        setActed({}); // ← clear acted badges on refresh
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
    setBusy((prev) => ({ ...prev, [user._id]: true })); // copies old object and adds one key and creates a new object

    try {
      const res = await approveUser(user._id);
      if (res.success) {
        setActed((prev) => ({ ...prev, [user._id]: 'approved' }));
        setModalQueue((prev) => [
          ...prev,
          {
            title: 'User Approved',
            message: `${user.username} has been approved. A verification email has been sent.`,
            variant: 'success',
          },
        ]);
      } else {
        setModalQueue((prev) => [
          ...prev,
          {
            title: 'Approval Failed',
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
      'Approve Application',
      `Approve ${user.username}? They will receive a verification email.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => runApprove(user) },
      ],
    );
  };
  const runReject = async (user: User) => {
    setBusy((prev) => ({ ...prev, [user._id]: true })); // copies old object and adds one key and creates a new object

    try {
      const res = await rejectUser(user._id);
      if (res.success) {
        setActed((prev) => ({ ...prev, [user._id]: 'rejected' }));
        setModalQueue((prev) => [
          ...prev,
          {
            title: 'User Rejected',
            message: `${user.username} has been rejected.`,
            variant: 'success',
          },
        ]);
      } else {
        setModalQueue((prev) => [
          ...prev,
          {
            title: 'Rejection Failed',
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
      'Reject Application',
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

  const renderItem = ({ item }: { item: User }) => {
    const isBusy = busy[item._id] === true;
    const action = acted[item._id];

    return (
      <View style={styles.card}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.meta}>{item.email}</Text>
        <Text style={styles.meta}>{item.phoneNumber}</Text>
        {item.bio ? <Text style={styles.bio}>{item.bio}</Text> : null}
        <Text style={styles.date}>
          Applied {new Date(item.createdAt ?? '').toLocaleDateString()}
        </Text>

        <View style={styles.actions}>
          {isBusy ? (
            <ActivityIndicator color={Colors.primary} />
          ) : action === 'approved' ? (
            <View style={[styles.badge, styles.badgeApproved]}>
              <Text style={styles.badgeText}>Approved</Text>
            </View>
          ) : action === 'rejected' ? (
            <View style={[styles.badge, styles.badgeRejected]}>
              <Text style={styles.badgeText}>Rejected</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnReject]}
                onPress={() => handleReject(item)}
              >
                <Text style={styles.btnRejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnApprove]}
                onPress={() => handleApprove(item)}
              >
                <Text style={styles.btnApproveText}>Approve</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && users.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPending}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = modalQueue[0];

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No pending applications</Text>
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
}) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.modalCard}>
        <Text
          style={[
            styles.modalIcon,
            variant === 'success' ? styles.iconSuccess : styles.iconError,
          ]}
        >
          {variant === 'success' ? '✓' : '✕'}
        </Text>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>Done</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

export default Pending;

const styles = StyleSheet.create({
  // ─────────────────────────────────────────────
  // Layout shells
  // ─────────────────────────────────────────────
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    flexGrow: 1, // lets ListEmptyComponent fill the screen and center
  },

  // ─────────────────────────────────────────────
  // User card
  // ─────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android equivalent of shadow
  },
  username: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },

  // ─────────────────────────────────────────────
  // Action row (buttons or badges or spinner)
  // ─────────────────────────────────────────────
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
    minHeight: 40, // keeps row height stable when spinner replaces buttons
  },

  // Buttons
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  btnApprove: {
    backgroundColor: Colors.primary,
  },
  btnApproveText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  btnReject: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  btnRejectText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },

  // Badges (shown after an action)
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  badgeApproved: {
    backgroundColor: Colors.successBg,
  },
  badgeRejected: {
    backgroundColor: Colors.dangerBg,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.textPrimary,
  },

  // ─────────────────────────────────────────────
  // Feedback modal
  // ─────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 44,
    fontWeight: '700',
    marginBottom: 12,
  },
  iconSuccess: {
    color: Colors.success,
  },
  iconError: {
    color: Colors.danger,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 15,
  },

  // ─────────────────────────────────────────────
  // Error + empty states
  // ─────────────────────────────────────────────
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
  retryButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
