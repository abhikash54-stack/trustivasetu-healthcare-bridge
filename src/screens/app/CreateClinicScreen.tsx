import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { invalidateQueries } from '../../api/queryClient';
import { MaterialIcons } from '@expo/vector-icons';

import { createClinic, CreateClinicInput } from '../../services/clinicService';
import { fetchRegions } from '../../services/regionsService';
import { listUsers } from '../../services/userManagementService';
import { Region, ManagedUser } from '../../types/auth';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BRAND } from '../../theme/theme';

interface FormState {
  name: string;
  address: string;
  accountNumber: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  businessPotential: string;
  regionId: string;
  regionName: string;
  assignedRMId: string;
  assignedRMName: string;
}

const EMPTY: FormState = {
  name: '',
  address: '',
  accountNumber: '',
  contactPerson: '',
  contactNumber: '',
  email: '',
  businessPotential: '',
  regionId: '',
  regionName: '',
  assignedRMId: '',
  assignedRMName: '',
};

export function CreateClinicScreen() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showRMPicker, setShowRMPicker] = useState(false);

  const regionsResult = useQuery<Region[]>({ queryKey: ['regions'], queryFn: fetchRegions }) as any;
  const regions: Region[] = regionsResult.data ?? [];

  const usersResult = useQuery<ManagedUser[]>({ queryKey: ['users'], queryFn: listUsers }) as any;
  const rmUsers: ManagedUser[] = (usersResult.data ?? []).filter(
    (u: ManagedUser) => u.role === 'REGIONAL_MANAGER'
  );

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
    if (!form.regionId.trim()) return Alert.alert('Required', 'Select a region — this is mandatory.');

    mutate({
      name: form.name,
      address: form.address,
      accountNumber: form.accountNumber,
      contactPerson: form.contactPerson,
      contactNumber: form.contactNumber,
      email: form.email,
      businessPotential: form.businessPotential,
      regionId: form.regionId,
      assignedRMId: form.assignedRMId,
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
        <FormInput
          label="Account Number"
          placeholder="Bank account number (optional)"
          value={form.accountNumber}
          onChangeText={set('accountNumber')}
          autoCapitalize="none"
        />

        <Text style={styles.sectionLabel}>Region & Assignment</Text>

        <Text style={styles.fieldLabel}>Region *</Text>
        <TouchableOpacity
          style={[styles.pickerButton, !form.regionId && styles.pickerButtonRequired]}
          onPress={() => setShowRegionPicker(true)}
        >
          <MaterialIcons name="map" size={18} color={form.regionId ? BRAND.primary : '#E74C3C'} style={{ marginRight: 8 }} />
          <Text style={[styles.pickerText, !form.regionName && styles.pickerPlaceholderRequired]}>
            {form.regionName || 'Select region (required)'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={22} color="#5A7A63" />
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Assigned Regional Manager</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowRMPicker(true)}>
          <MaterialIcons name="person" size={18} color="#5A7A63" style={{ marginRight: 8 }} />
          <Text style={[styles.pickerText, !form.assignedRMName && styles.pickerPlaceholder]}>
            {form.assignedRMName || 'Select RM (optional)'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={22} color="#5A7A63" />
        </TouchableOpacity>
        {form.assignedRMName ? (
          <TouchableOpacity
            onPress={() => setForm((p) => ({ ...p, assignedRMId: '', assignedRMName: '' }))}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>Clear selection</Text>
          </TouchableOpacity>
        ) : null}

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

      {/* Region picker modal */}
      <Modal
        visible={showRegionPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRegionPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Region</Text>
            <TouchableOpacity onPress={() => setShowRegionPicker(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {regions.length === 0 ? (
            <View style={styles.modalEmpty}>
              <ActivityIndicator color={BRAND.primary} />
              <Text style={styles.modalEmptyText}>Loading regions...</Text>
            </View>
          ) : (
            <FlatList
              data={regions}
              keyExtractor={(r) => r.id}
              renderItem={({ item: r }) => (
                <TouchableOpacity
                  style={styles.listOption}
                  onPress={() => {
                    setForm((p) => ({ ...p, regionId: r.id, regionName: r.name }));
                    setShowRegionPicker(false);
                  }}
                >
                  <View style={styles.listOptionIcon}>
                    <MaterialIcons name="map" size={18} color={BRAND.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listOptionName}>{r.name}</Text>
                    <Text style={styles.listOptionSub}>{r.code}</Text>
                  </View>
                  {form.regionId === r.id && (
                    <MaterialIcons name="check-circle" size={20} color={BRAND.accent} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ padding: 16 }}
            />
          )}
        </View>
      </Modal>

      {/* RM picker modal */}
      <Modal
        visible={showRMPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRMPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Regional Manager</Text>
            <TouchableOpacity onPress={() => setShowRMPicker(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {rmUsers.length === 0 ? (
            <View style={styles.modalEmpty}>
              <ActivityIndicator color={BRAND.primary} />
              <Text style={styles.modalEmptyText}>
                {usersResult.isLoading ? 'Loading users...' : 'No Regional Managers found'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={rmUsers}
              keyExtractor={(u) => u.id}
              renderItem={({ item: u }) => (
                <TouchableOpacity
                  style={styles.listOption}
                  onPress={() => {
                    setForm((p) => ({ ...p, assignedRMId: u.id, assignedRMName: u.name }));
                    setShowRMPicker(false);
                  }}
                >
                  <View style={styles.listOptionIcon}>
                    <MaterialIcons name="person" size={18} color={BRAND.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listOptionName}>{u.name}</Text>
                    <Text style={styles.listOptionSub}>{u.email}</Text>
                  </View>
                  {form.assignedRMId === u.id && (
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
  pickerButtonRequired: { borderColor: '#E74C3C', backgroundColor: '#FEF5F5' },
  pickerText: { flex: 1, fontSize: 15, color: '#1A2D1E' },
  pickerPlaceholder: { color: '#A0BBA8' },
  pickerPlaceholderRequired: { color: '#E74C3C' },
  clearBtn: { alignSelf: 'flex-end', marginBottom: 8 },
  clearBtnText: { fontSize: 12, color: BRAND.primary, fontWeight: '600' },
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
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
  },
  listOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listOptionName: { fontSize: 14, fontWeight: '600', color: '#1A2D1E' },
  listOptionSub: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
});
