import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { invalidateQueries } from '../../api/queryClient';

import { createClinic, CreateClinicInput } from '../../services/clinicService';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BRAND } from '../../theme/theme';

interface FormState {
  name: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  businessPotential: string;
}

const EMPTY: FormState = {
  name: '',
  address: '',
  contactPerson: '',
  contactNumber: '',
  email: '',
  businessPotential: '',
};

export function CreateClinicScreen() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState<FormState>(EMPTY);

  const { mutate, isPending } = useMutation({
    mutationFn: (input: CreateClinicInput) => createClinic(input),
    onSuccess: () => {
      invalidateQueries(['clinics']);
      Alert.alert('Partner onboarded', 'The channel partner has been registered successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        'Could not onboard the partner. Please try again.';
      Alert.alert('Onboarding failed', msg);
    },
  });

  const set = (key: keyof FormState) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) return Alert.alert('Required', 'Enter the clinic or hospital name.');
    if (!form.address.trim()) return Alert.alert('Required', 'Enter the address.');
    if (!form.contactPerson.trim()) return Alert.alert('Required', 'Enter the contact person name.');
    if (!form.contactNumber.trim() || form.contactNumber.trim().length < 10)
      return Alert.alert('Required', 'Enter a valid 10-digit contact number.');

    mutate({
      name: form.name,
      address: form.address,
      contactPerson: form.contactPerson,
      contactNumber: form.contactNumber,
      email: form.email,
      businessPotential: form.businessPotential,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Partner Information</Text>

        <FormInput
          label="Clinic / Hospital Name *"
          placeholder="e.g. Sunrise Multi-Speciality Hospital"
          value={form.name}
          onChangeText={set('name')}
          autoCapitalize="words"
        />
        <FormInput
          label="Address *"
          placeholder="Full address with city and PIN code"
          value={form.address}
          onChangeText={set('address')}
          autoCapitalize="sentences"
        />

        <Text style={styles.sectionLabel}>Contact Details</Text>

        <FormInput
          label="Contact Person *"
          placeholder="Name of the primary contact"
          value={form.contactPerson}
          onChangeText={set('contactPerson')}
          autoCapitalize="words"
        />
        <FormInput
          label="Contact Number *"
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          value={form.contactNumber}
          onChangeText={set('contactNumber')}
        />
        <FormInput
          label="Email"
          placeholder="clinic@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={set('email')}
        />

        <Text style={styles.sectionLabel}>Business Details</Text>

        <FormInput
          label="Business Potential (₹ per month)"
          placeholder="e.g. 1000000"
          keyboardType="numeric"
          value={form.businessPotential}
          onChangeText={set('businessPotential')}
        />

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={isPending ? 'Submitting...' : 'Onboard Partner'}
            onPress={handleSubmit}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 12,
  },
});
