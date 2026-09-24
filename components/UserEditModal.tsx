import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '@/context/AdminContext';
import { Colors } from '@/utils/colors';
import { User } from '@/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type FieldErrors = {
  username?: string;
  email?: string;
};

type Banner = { type: 'success' | 'error'; message: string } | null;

type Props = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onUpdated: (user: User) => void;
  onDeleted: (userId: string) => void;
};

type FieldProps = TextInputProps & {
  label: string;
  icon: IconName;
  error?: string;
  multiline?: boolean;
};

const Field = ({
  label,
  icon,
  error,
  multiline,
  ...inputProps
}: FieldProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          multiline && styles.inputBoxMultiline,
          focused && styles.inputBoxFocused,
          !!error && styles.inputBoxError,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            error ? Colors.danger : focused ? Colors.primary : Colors.textMuted
          }
          style={multiline ? styles.iconTop : undefined}
        />
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          {...inputProps}
        />
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={Colors.danger} />
          <Text style={styles.fieldError}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const UserEditModal = ({
  visible,
  user,
  onClose,
  onUpdated,
  onDeleted,
}: Props) => {
  const { updateUser, deactivateUser, activateUser, deleteUser } = useAdmin();

  // FIX: state is initialized directly from the `user` prop.
  // The parent renders this modal with a `key={user._id}`, so when a different
  // user is opened the whole component remounts and these initializers run
  // again with the new user's data. No useEffect needed.
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  if (!user) return null;

  const isEditable = user.role === 'editor';

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};

    if (!username.trim()) e.username = 'Username is required';
    else if (username.length < 3)
      e.username = 'Username must be at least 3 characters';
    else if (/\s/.test(username)) e.username = 'Username cannot contain spaces';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) e.email = 'Email is required';
    else if (!emailRegex.test(email)) e.email = 'Please enter a valid email';

    return e;
  };

  const handleSave = async () => {
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    setErrors({});
    setBanner(null);
    setLoading(true);

    try {
      const res = await updateUser(user._id, { username, email, bio });
      if (res.success && res.data) {
        setBanner({ type: 'success', message: 'User updated successfully' });
        onUpdated(res.data);
      } else {
        setBanner({ type: 'error', message: res.message ?? 'Update failed' });
      }
    } catch (err) {
      console.log(err);
      setBanner({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const runToggleActive = async () => {
    setBanner(null);
    setLoading(true);
    try {
      const res = user.isActive
        ? await deactivateUser(user._id)
        : await activateUser(user._id);

      if (res.success) {
        const next = { ...user, isActive: !user.isActive };
        setBanner({
          type: 'success',
          message: user.isActive
            ? 'User deactivated successfully'
            : 'User activated successfully',
        });
        onUpdated(next);
      } else {
        setBanner({ type: 'error', message: res.message ?? 'Action failed' });
      }
    } catch (err) {
      console.log(err);
      setBanner({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = () => {
    Alert.alert(
      user.isActive ? 'Deactivate User' : 'Activate User',
      user.isActive
        ? `${user.username} will no longer be able to log in.`
        : `${user.username} will be able to log in again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: runToggleActive },
      ],
    );
  };

  const runDelete = async () => {
    setBanner(null);
    setLoading(true);
    try {
      const res = await deleteUser(user._id);
      if (res.success) {
        onDeleted(user._id);
      } else {
        setBanner({ type: 'error', message: res.message ?? 'Delete failed' });
      }
    } catch (err) {
      console.log(err);
      setBanner({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete User',
      `Permanently delete ${user.username}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: runDelete,
        },
      ],
    );
  };

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.cardContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.headerName}>{user.username}</Text>
              <View style={styles.pillRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{roleLabel}</Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    user.isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                />
                <Text style={styles.statusText}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            {/* Banner */}
            {banner ? (
              <View
                style={[
                  styles.banner,
                  banner.type === 'success'
                    ? styles.successBanner
                    : styles.errorBanner,
                ]}
              >
                <Ionicons
                  name={
                    banner.type === 'success'
                      ? 'checkmark-circle'
                      : 'alert-circle'
                  }
                  size={20}
                  color={
                    banner.type === 'success' ? Colors.success : Colors.danger
                  }
                />
                <Text
                  style={[
                    styles.bannerText,
                    {
                      color:
                        banner.type === 'success'
                          ? Colors.success
                          : Colors.danger,
                    },
                  ]}
                >
                  {banner.message}
                </Text>
              </View>
            ) : null}

            {/* Edit form (editors only) */}
            {isEditable ? (
              <>
                <Field
                  label="Username"
                  icon="person-outline"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.username}
                />
                <Field
                  label="Email"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  error={errors.email}
                />
                <Field
                  label="Bio"
                  icon="document-text-outline"
                  multiline
                  value={bio}
                  onChangeText={setBio}
                  numberOfLines={3}
                  autoCapitalize="sentences"
                />

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabled]}
                  onPress={handleSave}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.textOnPrimary} />
                  ) : (
                    <>
                      <Ionicons
                        name="save-outline"
                        size={20}
                        color={Colors.textOnPrimary}
                      />
                      <Text style={styles.primaryButtonText}>Save changes</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Deactivate / Activate */}
                <TouchableOpacity
                  style={[styles.secondaryButton, loading && styles.disabled]}
                  onPress={handleToggleActive}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={
                      user.isActive
                        ? 'pause-circle-outline'
                        : 'play-circle-outline'
                    }
                    size={20}
                    color={Colors.warning}
                  />
                  <Text style={styles.secondaryButtonText}>
                    {user.isActive ? 'Deactivate user' : 'Activate user'}
                  </Text>
                </TouchableOpacity>

                {/* Delete */}
                <TouchableOpacity
                  style={[styles.dangerButton, loading && styles.disabled]}
                  onPress={handleDelete}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={Colors.danger}
                  />
                  <Text style={styles.dangerButtonText}>Delete user</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.readOnlyBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textMuted}
                />
                <Text style={styles.readOnlyText}>
                  {user.role === 'admin'
                    ? 'Admin accounts cannot be edited.'
                    : 'This user is pending approval.'}
                </Text>
              </View>
            )}

            {/* Close */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default UserEditModal;

const RADIUS = 20;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: RADIUS,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
  },
  cardContent: {
    padding: 22,
  },

  /* Header */
  header: { alignItems: 'center', marginBottom: 18 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.textOnPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    backgroundColor: Colors.textOnPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.success },
  dotInactive: { backgroundColor: Colors.textMuted },
  statusText: { fontSize: 13, color: Colors.textSecondary },

  /* Banner */
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  successBanner: { backgroundColor: Colors.successBg },
  errorBanner: { backgroundColor: Colors.dangerBg },
  bannerText: { flex: 1, fontSize: 14, fontWeight: '600' },

  /* Fields */
  fieldWrap: { marginBottom: 14 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inputBoxMultiline: { alignItems: 'flex-start', paddingVertical: 14 },
  inputBoxFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  inputBoxError: { borderColor: Colors.danger },
  iconTop: { marginTop: 2 },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginLeft: 2,
  },
  fieldError: { flex: 1, color: Colors.danger, fontSize: 13 },

  /* Buttons */
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  primaryButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.warningBg,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: Colors.warning,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    marginTop: 12,
  },
  dangerButtonText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: { opacity: 0.6 },

  /* Read-only */
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 14,
    marginBottom: 8,
  },
  readOnlyText: { flex: 1, color: Colors.textSecondary, fontSize: 14 },

  /* Close */
  closeButton: { alignItems: 'center', paddingVertical: 14, marginTop: 6 },
  closeButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
