import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { invalidateQueries } from '../../api/queryClient';
import { MaterialIcons } from '@expo/vector-icons';

import { createLead, CreateLeadInput } from '../../services/leadService';
import { fetchClinics } from '../../services/clinicService';
import { Clinic } from '../../types/auth';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BRAND } from '../../theme/theme';

const ENQUIRY_TYPES = [
  { value: 'MEDICAL', label: 'Medical Finance' },
  { value: 'PERSONAL', label: 'Personal Loan' },
  { value: 'BUSINESS', label: 'Business Loan' },
  { value: 'HOME', label: 'Home Loan' },
  { value: 'AUTO', label: 'Auto Loan' },
  { value: 'EDUCATION', label: 'Education Loan' },
];

interface FormState {
  applicantName: string;
  phone: string;
  email: string;
  amount: string;
  enquiryType: string;
  clinicId: string;
  clinicName: string;
}

const EMPTY: FormState = {
  applicantName: '',
  phone: '',
  email: '',
  amount: '',
  enquiryType: 'MEDICAL',
  clinicId: '',
  clinicName: '',
};

export function CreateLeadScreen() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showClinicPicker, setShowClinicPicker] = useState(false);

  const { data: clinics = [] } = useQuery<Clinic[]>({
    queryKey: ['clinics'],
    queryFn: fetchClinics,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (input: CreateLeadInput) => createLead(input),
    onSuccess: () => {
      invalidateQueries(['leads']);
      Alert.alert('Lead submitted', 'The lead has been created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        'Could not submit the lead. Please try again.';
      Alert.alert('Submission failed', msg);
    },
  });

  const set = (key: keyof FormState) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  const handleSubmit = () => {
    if (!form.applicantName.trim()) return Alert.alert('Required', "Enter the applicant's full name.");
    if (!form.phone.trim() || form.phone.trim().length < 10)
      return Alert.alert('Required', 'Enter a valid 10-digit phone number.');
    if (!form.enquiryType) return Alert.alert('Required', 'Select an enquiry type.');

    mutate({
      applicantName: form.applicantName,
      phone: form.phone,
      email: form.email,
      amount: form.amount,
      enquiryType: form.enquiryType,
      clinicId: form.clinicId,
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
        <Text style={styles.sectionLabel}>Applicant Details</Text>

        <FormInput
          label="Full Name *"
          placeholder="e.g. Ravi Kumar"
          value={form.applicantName}
          onChangeText={set('applicantName')}
          autoCapitalize="words"
        />
        <FormInput
          label="Phone *"
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={set('phone')}
        />
        <FormInput
          label="Email"
          placeholder="applicant@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={set('email')}
        />
        <FormInput
          label="Loan Amount (₹)"
          placeholder="e.g. 500000"
          keyboardType="numeric"
          value={form.amount}
          onChangeText={set('amount')}
        />

        <Text style={styles.sectionLabel}>Loan Details</Text>

        <Text style={styles.fieldLabel}>Enquiry Type *</Text>
        <View style={styles.chipRow}>
          {ENQUIRY_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, form.enquiryType === t.value && styles.chipActive]}
              onPress={() => setForm((p) => ({ ...p, enquiryType: t.value }))}
            >
              <Text style={[styles.chipText, form.enquiryType === t.value && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Channel Partner</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowClinicPicker(true)}>
          <Text style={[styles.pickerText, !form.clinicName && styles.pickerPlaceholder]}>
            {form.clinicName || 'Select channel partner (optional)'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={22} color="#5A7A63" />
        </TouchableOpacity>
        {form.clinicName ? (
          <TouchableOpacity
            onPress={() => setForm((p) => ({ ...p, clinicId: '', clinicName: '' }))}
            style={styles.clearPartner}
          >
            <Text style={styles.clearPartnerText}>Clear selection</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={isPending ? 'Submitting...' : 'Submit Lead'}
            onPress={handleSubmit}
            disabled={isPending}
          />
        </View>
      </ScrollView>

      {/* Clinic picker modal */}
      <Modal
        visible={showClinicPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowClinicPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Channel Partner</Text>
            <TouchableOpacity onPress={() => setShowClinicPicker(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {clinics.length === 0 ? (
            <View style={styles.modalEmpty}>
              <ActivityIndicator color={BRAND.primary} />
              <Text style={styles.modalEmptyText}>Loading partners...</Text>
            </View>
          ) : (
            <FlatList
              data={clinics}
              keyExtractor={(c) => c.id}
              renderItem={({ item: c }) => (
                <TouchableOpacity
                  style={styles.clinicOption}
                  onPress={() => {
                    setForm((p) => ({ ...p, clinicId: c.id, clinicName: c.name }));
                    setShowClinicPicker(false);
                  }}
                >
                  <View style={styles.clinicOptionIcon}>
                    <MaterialIcons name="local-hospital" size={18} color={BRAND.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clinicOptionName}>{c.name}</Text>
                    <Text style={styles.clinicOptionLocation}>{c.location || '—'}</Text>
                  </View>
                  {form.clinicId === c.id && (
                    <MaterialIcons name="check-circle" size={20} color={BRAND.accent} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ padding: 16 }}
            />
          )}
        </View>
      </Modal>
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
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C8DFD0',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: '#5A7A63' },
  chipTextActive: { color: '#FFFFFF' },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8DFD0',
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 4,
  },
  pickerText: { flex: 1, fontSize: 15, color: '#1A2D1E' },
  pickerPlaceholder: { color: '#A0BBA8' },
  clearPartner: { alignSelf: 'flex-end', marginBottom: 8 },
  clearPartnerText: { fontSize: 12, color: BRAND.primary, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
  modalEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  modalEmptyText: { color: '#5A7A63', fontSize: 14 },
  clinicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
  },
  clinicOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicOptionName: { fontSize: 14, fontWeight: '600', color: '#1A2D1E' },
  clinicOptionLocation: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
});
