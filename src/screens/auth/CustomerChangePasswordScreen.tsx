import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/core';
import { useMutation } from '@tanstack/react-query';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { changeCustomerPassword } from '../../services/customerAuthService';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { PASSWORD_POLICY_MESSAGE, validateStrongPassword } from '../../utils/validators';

export function CustomerChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token, customer } = route.params ?? {};

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isReady = useMemo(() => Boolean(token), [token]);

  const { mutate: submitChange, isPending } = useMutation({
    mutationFn: () => changeCustomerPassword(token, currentPassword, newPassword),
    onSuccess: () => {
      Alert.alert('Password updated', 'Your password has been updated successfully.', [
        {
          text: 'Continue',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{
                name: 'CustomerProfileCompletion',
                params: { token, customer },
              }],
            });
          },
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Could not update password', error?.message ?? 'Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!isReady) {
      return Alert.alert('Session expired', 'Please sign in again to continue.');
    }
    if (!currentPassword.trim()) {
      return Alert.alert('Required', 'Enter your current password.');
    }
    if (!validateStrongPassword(newPassword)) {
      return Alert.alert('Weak password', PASSWORD_POLICY_MESSAGE);
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Password mismatch', 'New passwords do not match.');
    }
    if (currentPassword === newPassword) {
      return Alert.alert('Same password', 'Choose a new password that is different from your current one.');
    }
    submitChange();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text variant="header" marginBottom="md">Create a new password</Text>
          <Text variant="body" marginBottom="lg">
            This password change is required the first time you sign in. Choose a secure password to continue.
          </Text>

          <FormInput
            label="Current password"
            placeholder="Enter your current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <FormInput
            label="New password"
            placeholder="8+ chars with upper/lower/number"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <FormInput
            label="Confirm new password"
            placeholder="Re-enter your new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <PrimaryButton
            label={isPending ? 'Updating password...' : 'Continue'}
            onPress={handleSubmit}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BRAND.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
});
