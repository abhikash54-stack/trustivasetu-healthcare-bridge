import { Pressable, Text } from 'react-native';
import { Text as StyledText, Box } from '../theme/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: disabled ? '#B5C6E0' : '#0B71EB',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <StyledText variant="body" style={{ color: '#FFFFFF' }}>
        {label}
      </StyledText>
    </Pressable>
  );
}
