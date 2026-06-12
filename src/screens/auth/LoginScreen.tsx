import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
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
      <View style={styles.card}>
        <Text variant="header" marginBottom="md">
          Welcome back
        </Text>
        <Text variant="body" marginBottom="lg">
          Sign in to access your healthcare fintech dashboard.
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F9FF',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    color: '#0B71EB',
  },
});
