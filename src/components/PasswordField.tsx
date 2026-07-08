import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { FormInput } from './FormInput';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export function PasswordField({ label, value, onChangeText, placeholder }: PasswordFieldProps) {
  return (
    <FormInput
      label={label}
      placeholder={placeholder}
      secureTextEntry
      value={value}
      onChangeText={onChangeText}
    />
  );
}
