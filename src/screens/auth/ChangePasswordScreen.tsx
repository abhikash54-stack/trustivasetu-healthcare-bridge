import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { changePassword, logout } from '../../services/authService';
import { clearUser } from '../../services/storageService';
import { signOut } from '../../store/slices/authSlice';

export function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();

  const { mutate: submitChange, isPending } = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      Alert.alert(
        'Password changed',
        'Your password has been updated. You will be signed out.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await logout();
              await clearUser();
              dispatch(signOut());
            },
          },
        ],
        { cancelable: false },
      );
    },
    onError: (error: any) => {
      const message: string =
        error?.response?.data?.message ??
        'Failed to change password. Please check your current password.';
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    if (!currentPassword) {
      return Alert.alert('Required', 'Enter your current password.');
    }
    if (newPassword.length < 8) {
      return Alert.alert('Weak password', 'New password must be at least 8 characters.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Password mismatch', 'New passwords do not match.');
    }
    if (currentPassword === newPassword) {
      return Alert.alert('Same password', 'New password must differ from your current password.');
    }
    submitChange();
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
        <View style={styles.iconWrap}>
          <MaterialIcons name="lock-reset" size={40} color={BRAND.primary} />
        </View>

        <Text variant="header" marginBottom="md">Change password</Text>
        <Text variant="body" marginBottom="lg">
          Enter your current password, then choose a new secure password.
          You will be signed out after the change.
        </Text>

        <FormInput
          label="Current password"
          placeholder="••••••••"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <FormInput
          label="New password"
          placeholder="Minimum 8 characters"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <FormInput
          label="Confirm new password"
          placeholder="Re-enter new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <PrimaryButton
          label={isPending ? 'Changing...' : 'Change password'}
          onPress={handleSubmit}
          disabled={isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: BRAND.background,
    padding: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
});
