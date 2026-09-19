import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type FieldErrors = {
  username?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  bio?: string;
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');

  const { register } = useAuth();

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

  const handleRegister = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError('');
    setLoading(true);

    try {
      const response = await register({
        username,
        email,
        phoneNumber,
        password,
        bio,
      });

      if (response.success) {
        Alert.alert(
          'Application Submitted',
          'Your application has been sent for admin approval. You will be able to log in once approved.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }],
        );
      } else {
        setServerError(response.message ?? 'Registration failed');
      }
    } catch (err) {
      console.log(err);
      setServerError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Account</Text>

          {serverError ? (
            <Text style={styles.serverError}>{serverError}</Text>
          ) : null}

          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.username && (
            <Text style={styles.fieldError}>{errors.username}</Text>
          )}

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {errors.email && (
            <Text style={styles.fieldError}>{errors.email}</Text>
          )}

          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone number"
            keyboardType="phone-pad"
          />
          {errors.phoneNumber && (
            <Text style={styles.fieldError}>{errors.phoneNumber}</Text>
          )}

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
          />
          {errors.password && (
            <Text style={styles.fieldError}>{errors.password}</Text>
          )}

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            autoCapitalize="none"
          />
          {errors.confirmPassword && (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          )}

          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Short bio"
            multiline
            numberOfLines={3}
            autoCapitalize="sentences"
          />
          {errors.bio && <Text style={styles.fieldError}>{errors.bio}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Apply</Text>
            )}
          </TouchableOpacity>

          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#6C63FF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    fontSize: 16,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  fieldError: {
    color: '#d32f2f',
    fontSize: 13,
    marginBottom: 10,
  },
  serverError: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: {
    color: '#6C63FF',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});

export default Register;
