import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../types/navigation';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { validateEmail } from '../../utils/validators';
import { Text } from '../../theme/theme';

type ForgotNavigationProp = any;

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      return Alert.alert('Invalid email', 'Please provide a valid email address.');
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Reset requested', 'Check your email for password reset instructions.');
      navigation.navigate('Login');
    }, 1200);
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
          <PrimaryButton label={loading ? 'Sending...' : 'Request reset'} onPress={handleSubmit} disabled={loading} />
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
