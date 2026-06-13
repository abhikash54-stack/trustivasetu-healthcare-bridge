import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { validateEmail } from '../../utils/validators';
import { requestPasswordReset } from '../../services/authService';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigation = useNavigation<any>();

  const { mutate: submitReset, isPending } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: any) => {
      const message: string = error?.response?.data?.message ?? 'Unable to send reset email. Please try again.';
      Alert.alert('Request failed', message);
    },
  });

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      return Alert.alert('Invalid email', 'Please provide a valid email address.');
    }
    submitReset(email);
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.card}>
          <Text variant="header" marginBottom="md">Check your email</Text>
          <Text variant="body" marginBottom="lg">
            If an account exists for {email}, you will receive password reset instructions shortly.
          </Text>
          <PrimaryButton label="Back to sign in" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text variant="header" marginBottom="md">Forgot password</Text>
          <Text variant="body" marginBottom="lg">
            Enter your registered email to receive password recovery instructions.
          </Text>
          <FormInput
            label="Email"
            placeholder="email@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <PrimaryButton
            label={isPending ? 'Sending...' : 'Send reset link'}
            onPress={handleSubmit}
            disabled={isPending}
          />
          <Text
            variant="secondary"
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            Back to sign in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: BRAND.background,
    justifyContent: 'center',
    padding: 24,
  },
  successContainer: {
    flex: 1,
    backgroundColor: BRAND.background,
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
  backLink: {
    textAlign: 'center',
    marginTop: 16,
    color: BRAND.primary,
  },
});
