import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { register } from '../../services/authService';
import { saveAuthState } from '../../services/storageService';
import { tokenManager } from '../../api/tokenManager';
import { signIn } from '../../store/slices/authSlice';
import { validateEmail } from '../../utils/validators';
import { APP_INFO } from '../../config/environment';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: RegisterForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export function SignUpScreen() {
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const { mutate: submitRegister, isPending } = useMutation({
    mutationFn: () =>
      register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      }),
    onSuccess: async (data: import('../../types/auth').AuthResponse) => {
      tokenManager.setTokens(data.token, data.refreshToken);
      await saveAuthState(data.token, data.refreshToken, data.user);
      dispatch(signIn({ token: data.token, refreshToken: data.refreshToken, user: data.user }));
    },
    onError: (error: any) => {
      const message: string =
        error?.response?.data?.message ?? 'Registration failed. Please try again.';
      Alert.alert('Registration failed', message);
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      return Alert.alert('Required', 'Enter your full name.');
    }
    if (!validateEmail(form.email)) {
      return Alert.alert('Invalid email', 'Enter a valid email address.');
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      return Alert.alert('Invalid phone', 'Enter a valid 10-digit phone number.');
    }
    if (form.password.length < 8) {
      return Alert.alert('Weak password', 'Password must be at least 8 characters.');
    }
    if (form.password !== form.confirmPassword) {
      return Alert.alert('Password mismatch', 'Passwords do not match.');
    }
    submitRegister();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandHeader}>
          <View style={styles.logoWrap}>
            <RNText style={styles.logoLetter}>T</RNText>
          </View>
          <RNText style={styles.appName}>{APP_INFO.name}</RNText>
          <RNText style={styles.tagline}>{APP_INFO.tagline}</RNText>
        </View>

        <View style={styles.card}>
          <Text variant="header" marginBottom="md">Create account</Text>
          <Text variant="body" marginBottom="lg">
            Register to access the TrustivaSetu LMS platform.
          </Text>

          <FormInput
            label="Full Name *"
            placeholder="e.g. Ravi Kumar"
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          />
          <FormInput
            label="Email *"
            placeholder="email@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
          />
          <FormInput
            label="Phone *"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
          />
          <FormInput
            label="Password *"
            placeholder="Minimum 8 characters"
            secureTextEntry
            value={form.password}
            onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
          />
          <FormInput
            label="Confirm Password *"
            placeholder="Re-enter password"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
          />

          <PrimaryButton
            label={isPending ? 'Creating account...' : 'Create account'}
            onPress={handleSubmit}
            disabled={isPending}
          />

          <Text
            variant="secondary"
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            Already have an account? Sign in
          </Text>
        </View>

        <RNText style={styles.copyright}>{APP_INFO.copyright}</RNText>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 24,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagline: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
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
  loginLink: {
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
