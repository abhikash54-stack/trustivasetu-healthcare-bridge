import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { validateEmail } from '../../utils/validators';
import { requestPasswordReset } from '../../services/authService';
import { Text } from '../../theme/theme';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<any>();

  const { mutate: submitReset, isPending } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      Alert.alert('Reset requested', 'Check your email for password reset instructions.');
      navigation.navigate('Login');
    },
    onError: () => {
      Alert.alert('Request failed', 'Unable to send reset email. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      return Alert.alert('Invalid email', 'Please provide a valid email address.');
    }
    submitReset(email);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text variant="header" marginBottom="md">
            Forgot password
          </Text>
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
            label={isPending ? 'Sending...' : 'Request reset'}
            onPress={handleSubmit}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
});
