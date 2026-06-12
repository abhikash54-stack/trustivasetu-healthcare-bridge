import { TextInput, TextInputProps } from 'react-native';
import { createBox, createText } from '@shopify/restyle';

const Box = createBox();
const Text = createText();

interface FormInputProps extends TextInputProps {
  label: string;
}

export function FormInput({ label, ...props }: FormInputProps) {
  return (
    <Box marginBottom="md">
      <Text variant="label" marginBottom="xs">
        {label}
      </Text>
      <TextInput
        {...props}
        style={{
          backgroundColor: '#F8FAFF',
          borderRadius: 16,
          padding: 16,
          fontSize: 16,
          color: '#1F2A37',
          borderWidth: 1,
          borderColor: '#E6ECF4',
        }}
      />
    </Box>
  );
}
