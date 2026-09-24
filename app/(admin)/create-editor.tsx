import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '@/context/AdminContext';
import { Colors } from '@/utils/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type FieldErrors = {
  username?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  bio?: string;
};

/* ------------------------------------------------------------------ */
/* Reusable pieces                                                     */
/* ------------------------------------------------------------------ */

type FieldProps = TextInputProps & {
  label: string;
  icon: IconName;
  error?: string;
  inputRef?: React.RefObject<TextInput | null>;
  multiline?: boolean;
  // Password fields get a show/hide toggle
  isPassword?: boolean;
};

const Field = ({
  label,
  icon,
  error,
  inputRef,
  multiline,
  isPassword,
  ...inputProps
}: FieldProps) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

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
          ref={inputRef}
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          secureTextEntry={isPassword ? hidden : undefined}
          {...inputProps}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
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

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

const CreateEditor = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const { createEditor } = useAdmin();

  // Refs so "next" on the keyboard moves through the form
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);

  // Ref to hold the timeout so we can clear it if the user submits again
  // or navigates away before it fires
  const successTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount — cancels any pending timeout
  useEffect(() => {
    return () => {
      if (successTimeout.current) clearTimeout(successTimeout.current);
    };
  }, []);

  // Validation — pure function, returns an object of field errors
  const validate = (): FieldErrors => {
    const e: FieldErrors = {};

    if (!username.trim()) e.username = 'Username is required';
    else if (username.length < 3)
      e.username = 'Username must be at least 3 characters';
    else if (/\s/.test(username)) e.username = 'Username cannot contain spaces';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) e.email = 'Email is required';
    else if (!emailRegex.test(email)) e.email = 'Please enter a valid email';

    const phoneRegex = /^\+?[0-9\s\-()]{10,15}$/;
    if (!phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    else if (!phoneRegex.test(phoneNumber))
      e.phoneNumber = 'Please enter a valid phone number';

    if (!password) e.password = 'Password is required';
    else if (password.length < 6)
      e.password = 'Password must be at least 6 characters';

    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)
      e.confirmPassword = 'Passwords do not match';

    if (!bio.trim()) e.bio = 'Bio is required';

    return e;
  };

  // Clears both banners — called whenever the user types in any input
  const clearBanners = () => {
    if (success) setSuccess('');
    if (serverError) setServerError('');
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await createEditor({
        username,
        email,
        phoneNumber,
        password,
        bio,
      });

      if (response.success) {
        setSuccess('Editor created successfully');

        // Clear the form
        setUsername('');
        setEmail('');
        setPhoneNumber('');
        setPassword('');
        setConfirmPassword('');
        setBio('');
        setErrors({});
        setServerError('');

        // Clear any existing timeout first so rapid re-submits don't
        // create overlapping timers that fire out of order.
        if (successTimeout.current) clearTimeout(successTimeout.current);
        successTimeout.current = setTimeout(() => setSuccess(''), 3000);
      } else {
        setServerError(response.message ?? 'Failed to create editor');
      }
    } catch (error) {
      console.log(error);
      setServerError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Intro */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="person-add" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Create editor</Text>
            <Text style={styles.subtitle}>
              Add a new editor account. They&apos;ll be able to sign in with the
              details below.
            </Text>
          </View>

          {/* Banners */}
          {success ? (
            <View style={[styles.banner, styles.successBanner]}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={[styles.bannerText, { color: Colors.success }]}>
                {success}
              </Text>
            </View>
          ) : null}

          {serverError ? (
            <View style={[styles.banner, styles.errorBanner]}>
              <Ionicons name="alert-circle" size={20} color={Colors.danger} />
              <Text style={[styles.bannerText, { color: Colors.danger }]}>
                {serverError}
              </Text>
            </View>
          ) : null}

          {/* Account */}
          <Section title="Account">
            <Field
              label="Username"
              icon="person-outline"
              value={username}
              onChangeText={(v) => {
                clearBanners();
                setUsername(v);
              }}
              placeholder="e.g. jdoe"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.username}
            />
            <Field
              label="Email"
              icon="mail-outline"
              inputRef={emailRef}
              value={email}
              onChangeText={(v) => {
                clearBanners();
                setEmail(v);
              }}
              placeholder="name@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.email}
            />
            <Field
              label="Phone number"
              icon="call-outline"
              inputRef={phoneRef}
              value={phoneNumber}
              onChangeText={(v) => {
                clearBanners();
                setPhoneNumber(v);
              }}
              placeholder="+234 800 000 0000"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
            />
          </Section>

          {/* Security */}
          <Section title="Security">
            <Field
              label="Password"
              icon="lock-closed-outline"
              inputRef={passwordRef}
              isPassword
              value={password}
              onChangeText={(v) => {
                clearBanners();
                setPassword(v);
              }}
              placeholder="At least 6 characters"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.password}
            />
            <Field
              label="Confirm password"
              icon="shield-checkmark-outline"
              inputRef={confirmRef}
              isPassword
              value={confirmPassword}
              onChangeText={(v) => {
                clearBanners();
                setConfirmPassword(v);
              }}
              placeholder="Re-enter password"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => bioRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.confirmPassword}
            />
          </Section>

          {/* Profile */}
          <Section title="Profile">
            <Field
              label="Short bio"
              icon="document-text-outline"
              inputRef={bioRef}
              multiline
              value={bio}
              onChangeText={(v) => {
                clearBanners();
                setBio(v);
              }}
              placeholder="A line or two about this editor"
              numberOfLines={3}
              autoCapitalize="sentences"
              error={errors.bio}
            />
          </Section>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Create editor"
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color={Colors.textOnPrimary}
                />
                <Text style={styles.buttonText}>Create editor</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateEditor;

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
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },

  /* Intro */
  hero: { alignItems: 'center', marginBottom: 24, marginTop: 4 },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.primary + '1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
  },

  /* Banners */
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  successBanner: { backgroundColor: Colors.successBg },
  errorBanner: { backgroundColor: Colors.dangerBg },
  bannerText: { flex: 1, fontSize: 14, fontWeight: '600' },

  /* Sections */
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: RADIUS,
    padding: 16,
    gap: 16,
    ...cardShadow,
  },

  /* Fields */
  fieldWrap: {},
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

  /* Submit */
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
});
