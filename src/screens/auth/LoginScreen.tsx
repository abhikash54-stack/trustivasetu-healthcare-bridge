import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Text as RNText } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';

import { signIn } from '../../store/slices/authSlice';
import { LoginCredentials } from '../../types/auth';
import { login } from '../../services/authService';
import { saveUser } from '../../services/storageService';
import { validateEmail, validatePassword } from '../../utils/validators';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { APP_INFO } from '../../config/environment';

const STATUS_MESSAGES: Record<string, string> = {
  INACTIVE: 'Your account is inactive. Please contact your administrator.',
  SUSPENDED: 'Your account has been suspended. Please contact your administrator.',
  BLOCKED: 'Your account has been blocked. Please contact your administrator.',
  TERMINATED: 'Your account has been terminated. Please contact your administrator.',
};

function resolveStatusMessage(error: any): string | null {
  const httpStatus: number | undefined = error?.response?.status;
  const userStatus: string | undefined = error?.response?.data?.userStatus;
  const reason: string | undefined = error?.response?.data?.reason;
  const statusKey = userStatus ?? reason;

  if (httpStatus === 403 || statusKey) {
    return STATUS_MESSAGES[statusKey ?? ''] ?? 'Your account has been disabled. Please contact administrator.';
  }
  return null;
}

export function LoginScreen() {
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: login,
    onSuccess: async (data: import('../../services/authService').LoginResult) => {
      await saveUser(data.user);
      dispatch(signIn({ user: data.user }));
    },
    onError: (error: any) => {
      const statusMsg = resolveStatusMessage(error);
      if (statusMsg) {
        Alert.alert('Account disabled', statusMsg);
        return;
      }
      const message: string = error?.response?.data?.message ?? 'Invalid email or password. Please try again.';
      Alert.alert('Login failed', message);
    },
  });

  const handleSubmit = () => {
    if (!validateEmail(form.email)) {
      return Alert.alert('Invalid email', 'Enter a valid email address.');
    }
    if (!validatePassword(form.password)) {
      return Alert.alert('Invalid password', 'Password must be at least 8 characters.');
    }
    submitLogin(form);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.brandHeader}>
        <View style={styles.logoWrap}>
          <RNText style={styles.logoLetter}>T</RNText>
        </View>
        <RNText style={styles.appName}>{APP_INFO.name}</RNText>
        <RNText style={styles.tagline}>{APP_INFO.tagline}</RNText>
      </View>

      <View style={styles.card}>
        <Text variant="header" marginBottom="md">Welcome back</Text>
        <Text variant="body" marginBottom="lg">Sign in to access your LMS dashboard.</Text>

        <FormInput
          label="Email"
          placeholder="email@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
        />
        <FormInput
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={form.password}
          onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
        />

        <Text
          variant="secondary"
          style={styles.forgot}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          Forgot password?
        </Text>

        <PrimaryButton
          label={isPending ? 'Signing in...' : 'Sign in'}
          onPress={handleSubmit}
          disabled={isPending}
        />

        <Text
          variant="secondary"
          style={styles.signUpLink}
          onPress={() => navigation.navigate('SignUp')}
        >
          New user? Request access
        </Text>
      </View>

      <RNText style={styles.copyright}>{APP_INFO.copyright}</RNText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: BRAND.primary,
    justifyContent: 'center',
    padding: 24,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagline: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    color: BRAND.primary,
  },
  signUpLink: {
    textAlign: 'center',
    marginTop: 16,
    color: BRAND.primary,
  },
  copyright: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
