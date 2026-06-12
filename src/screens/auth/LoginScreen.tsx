import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Text as RNText } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';

import { signIn } from '../../store/slices/authSlice';
import { LoginCredentials } from '../../types/auth';
import { login } from '../../services/authService';
import { validateEmail, validatePassword } from '../../utils/validators';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { APP_INFO } from '../../config/environment';

export function LoginScreen() {
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data: any) => {
      dispatch(signIn({ token: data.token, user: data.user }));
    },
    onError: () => {
      Alert.alert('Login failed', 'Invalid email or password. Please try again.');
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
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoWrap}>
          <RNText style={styles.logoLetter}>T</RNText>
        </View>
        <RNText style={styles.appName}>{APP_INFO.name}</RNText>
        <RNText style={styles.tagline}>{APP_INFO.tagline}</RNText>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text variant="header" marginBottom="md">
          Welcome back
        </Text>
        <Text variant="body" marginBottom="lg">
          Sign in to access your LMS dashboard.
        </Text>
        <FormInput
          label="Email"
          placeholder="email@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
        />
        <FormInput
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={form.password}
          onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
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
  copyright: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
