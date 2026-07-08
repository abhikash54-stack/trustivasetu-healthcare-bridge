import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { validateEmail } from '../../utils/validators';
import { APP_INFO } from '../../config/environment';
import { publicClient } from '../../api/axios';

interface RequestForm {
  name: string;
  email: string;
  phone: string;
  clinic: string;
  city: string;
}

const EMPTY: RequestForm = { name: '', email: '', phone: '', clinic: '', city: '' };

async function submitAccessRequest(form: RequestForm): Promise<void> {
  await publicClient.post('/enquiries/provider', {
    source: 'MOBILE_APP',
    contactPerson: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    mobile: form.phone.trim(),
    clinicName: form.clinic.trim(),
    city: form.city.trim(),
    notes: 'Access request from TrustivaSetu mobile app',
  });
}

export function SignUpScreen() {
  const [form, setForm] = useState<RequestForm>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const navigation = useNavigation<any>();

  const { mutate: submitRequest, isPending } = useMutation({
    mutationFn: () => submitAccessRequest(form),
    onSuccess: () => setSubmitted(true),
    onError: (error: any) => {
      const message: string =
        error?.response?.data?.message ?? 'Request failed. Please try again.';
      Alert.alert('Request failed', message);
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return Alert.alert('Required', 'Enter your full name.');
    if (!validateEmail(form.email)) return Alert.alert('Invalid email', 'Enter a valid email address.');
    if (form.phone.replace(/\D/g, '').length < 10)
      return Alert.alert('Invalid phone', 'Enter a valid 10-digit mobile number.');
    if (!form.clinic.trim()) return Alert.alert('Required', 'Enter your clinic or organisation name.');
    if (!form.city.trim()) return Alert.alert('Required', 'Enter your city.');
    submitRequest();
  };

  if (submitted) {
    return (
      <View style={styles.successWrap}>
        <View style={styles.card}>
          <Text variant="header" marginBottom="md">Request submitted</Text>
          <Text variant="body" marginBottom="lg">
            Your access request has been received. An administrator will review it and
            send your login credentials to {form.email}.
          </Text>
          <PrimaryButton label="Back to sign in" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandHeader}>
          <View style={styles.logoWrap}>
            <RNText style={styles.logoLetter}>T</RNText>
          </View>
          <RNText style={styles.appName}>{APP_INFO.name}</RNText>
          <RNText style={styles.tagline}>{APP_INFO.tagline}</RNText>
        </View>

        <View style={styles.card}>
          <Text variant="header" marginBottom="md">Request access</Text>
          <Text variant="body" marginBottom="lg">
            Fill in your details and an administrator will set up your account.
          </Text>

          <FormInput
            label="Full Name *"
            placeholder="e.g. Ravi Kumar"
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          />
          <FormInput
            label="Email *"
            placeholder="email@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
          />
          <FormInput
            label="Mobile *"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
          />
          <FormInput
            label="Clinic / Organisation *"
            placeholder="e.g. City Healthcare Clinic"
            value={form.clinic}
            onChangeText={(v) => setForm((p) => ({ ...p, clinic: v }))}
          />
          <FormInput
            label="City *"
            placeholder="e.g. Mumbai"
            value={form.city}
            onChangeText={(v) => setForm((p) => ({ ...p, city: v }))}
          />

          <PrimaryButton
            label={isPending ? 'Submitting...' : 'Submit request'}
            onPress={handleSubmit}
            disabled={isPending}
          />

          <Text
            variant="secondary"
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            Already have an account? Sign in
          </Text>
        </View>

        <RNText style={styles.copyright}>{APP_INFO.copyright}</RNText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: BRAND.primary,
    justifyContent: 'center',
    padding: 24,
  },
  successWrap: {
    flex: 1,
    backgroundColor: BRAND.primary,
    justifyContent: 'center',
    padding: 24,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoLetter: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  appName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  tagline: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  loginLink: { textAlign: 'center', marginTop: 16, color: BRAND.primary },
  copyright: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
