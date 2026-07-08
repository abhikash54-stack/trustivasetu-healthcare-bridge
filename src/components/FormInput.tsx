import { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, Box } from '../theme/theme';
import { BRAND } from '../theme/theme';

interface FormInputProps extends TextInputProps {
  label: string;
}

export function FormInput({
  label,
  secureTextEntry,
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = !!secureTextEntry;

  return (
    <Box marginBottom="md">
      <Text variant="label" marginBottom="xs">
        {label}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F8FAFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E6ECF4',
          paddingHorizontal: 16,
        }}
      >
        <TextInput
          {...props}
          secureTextEntry={
            isPasswordField ? !showPassword : false
          }
          style={{
            flex: 1,
            fontSize: 16,
            color: '#10221A',
            paddingVertical: 16,
          }}
        />

        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color={BRAND.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </Box>
  );
}