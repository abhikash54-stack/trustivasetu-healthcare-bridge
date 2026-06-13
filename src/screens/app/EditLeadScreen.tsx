import React, { useState, useEffect } from 'react';
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

import { fetchLeadById, updateLead, UpdateLeadInput } from '../../services/leadService';
import { fetchLenders } from '../../services/lendersService';
import { LeadDetail, Lender } from '../../types/auth';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BRAND } from '../../theme/theme';
import { formatStatus, statusColor } from '../../utils/format';

interface EditLeadScreenProps {
  route: { params: { leadId: string } };
}

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'DISBURSED', 'REJECTED', 'CANCELLED'];

interface FormState {
  applicantName: string;
  phone: string;
  amount: string;
  status: string;
  approvedAmount: string;
  disbursedAmount: string;
  lenderId: string;
  lenderName: string;
  approvalDate: string;
  disbursalDate: string;
  applicationDate: string;
  remarks: string;
}

export function EditLeadScreen({ route }: EditLeadScreenProps) {
  const { leadId } = route.params;
  const navigation = useNavigation<any>();

  const [form, setForm] = useState<FormState>({
    applicantName: '',
    phone: '',
    amount: '',
    status: '',
    approvedAmount: '',
    disbursedAmount: '',
    lenderId: '',
    lenderName: '',
    approvalDate: '',
    disbursalDate: '',
    applicationDate: '',
    remarks: '',
  });
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showLenderPicker, setShowLenderPicker] = useState(false);

  const leadResult = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => fetchLeadById(leadId),
  }) as any;
  const lead = leadResult.data as LeadDetail | undefined;
  const isLoading: boolean = leadResult.isLoading;

  const lendersResult = useQuery<Lender[]>({ queryKey: ['lenders'], queryFn: fetchLenders }) as any;
  const lenders: Lender[] = lendersResult.data ?? [];

  useEffect(() => {
    if (lead) {
      setForm({
        applicantName: lead.applicantName ?? '',
        phone: lead.phone ?? '',
        amount: lead.amount ?? '',
        status: lead.status ?? '',
        approvedAmount: lead.approvedAmount ?? '',
        disbursedAmount: lead.disbursedAmount ?? '',
        lenderId: lead.lenderId ?? '',
        lenderName: lead.lenderName ?? '',
        approvalDate: lead.approvalDate ? lead.approvalDate.split('T')[0] : '',
        disbursalDate: lead.disbursalDate ? lead.disbursalDate.split('T')[0] : '',
        applicationDate: lead.applicationDate ? lead.applicationDate.split('T')[0] : '',
        remarks: lead.remarks ?? '',
      });
    }
  }, [lead]);

  const updateMutation = useMutation({
    mutationFn: (input: UpdateLeadInput) => updateLead(leadId, input),
    onSuccess: () => {
      invalidateQueries(['lead', leadId], ['leads']);
      Alert.alert('Lead updated', 'The lead has been updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        'Could not update the lead. Please try again.';
      Alert.alert('Update failed', msg);
    },
  });

  const set = (key: keyof FormState) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  const handleSave = () => {
    if (!form.applicantName.trim()) return Alert.alert('Required', "Enter the applicant's full name.");
    if (!form.phone.trim() || form.phone.trim().length < 10)
      return Alert.alert('Required', 'Enter a valid 10-digit phone number.');

    const input: UpdateLeadInput = {
      applicantName: form.applicantName.trim(),
      phone: form.phone.trim(),
      remarks: form.remarks.trim(),
    };
    if (form.amount.trim()) input.amount = Number(form.amount.trim());
    if (form.status.trim()) input.status = form.status.trim();
    if (form.approvedAmount.trim()) input.approvedAmount = Number(form.approvedAmount.trim());
    if (form.disbursedAmount.trim()) input.disbursedAmount = Number(form.disbursedAmount.trim());
    if (form.lenderId) input.lenderId = form.lenderId;
    if (form.approvalDate.trim()) input.approvalDate = form.approvalDate.trim();
    if (form.disbursalDate.trim()) input.disbursalDate = form.disbursalDate.trim();
    if (form.applicationDate.trim()) input.applicationDate = form.applicationDate.trim();

    updateMutation.mutate(input);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND.primary} size="large" />
        <Text style={styles.loadingText}>Loading lead...</Text>
      </View>
    );
  }

  const statusClr = statusColor(form.status);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Applicant</Text>
        <FormInput
          label="Full Name *"
          placeholder="Applicant name"
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
          label="Loan Amount (₹)"
          placeholder="e.g. 500000"
          keyboardType="numeric"
          value={form.amount}
          onChangeText={set('amount')}
        />

        <Text style={styles.sectionLabel}>Status & Financials</Text>

        <Text style={styles.fieldLabel}>Status</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatusPicker(true)}>
          <View style={[styles.statusDot, { backgroundColor: statusClr }]} />
          <Text style={styles.pickerText}>{form.status ? formatStatus(form.status) : 'Select status'}</Text>
          <MaterialIcons name="arrow-drop-down" size={22} color="#5A7A63" />
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Lender</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowLenderPicker(true)}>
          <MaterialIcons name="account-balance" size={18} color="#5A7A63" style={{ marginRight: 8 }} />
          <Text style={[styles.pickerText, !form.lenderName && styles.pickerPlaceholder]}>
            {form.lenderName || 'Select lender'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={22} color="#5A7A63" />
        </TouchableOpacity>
        {form.lenderName ? (
          <TouchableOpacity
            onPress={() => setForm((p) => ({ ...p, lenderId: '', lenderName: '' }))}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>Clear lender</Text>
          </TouchableOpacity>
        ) : null}

        <FormInput
          label="Approved Amount (₹)"
          placeholder="e.g. 450000"
          keyboardType="numeric"
          value={form.approvedAmount}
          onChangeText={set('approvedAmount')}
        />
        <FormInput
          label="Disbursed Amount (₹)"
          placeholder="e.g. 425000"
          keyboardType="numeric"
          value={form.disbursedAmount}
          onChangeText={set('disbursedAmount')}
        />

        <Text style={styles.sectionLabel}>Dates (YYYY-MM-DD)</Text>

        <FormInput
          label="Application Date"
          placeholder="e.g. 2026-06-01"
          value={form.applicationDate}
          onChangeText={set('applicationDate')}
          autoCapitalize="none"
        />
        <FormInput
          label="Approval Date"
          placeholder="e.g. 2026-06-10"
          value={form.approvalDate}
          onChangeText={set('approvalDate')}
          autoCapitalize="none"
        />
        <FormInput
          label="Disbursal Date"
          placeholder="e.g. 2026-06-13"
          value={form.disbursalDate}
          onChangeText={set('disbursalDate')}
          autoCapitalize="none"
        />

        <Text style={styles.sectionLabel}>Notes</Text>
        <FormInput
          label="Remarks"
          placeholder="Any notes about this lead"
          value={form.remarks}
          onChangeText={set('remarks')}
          autoCapitalize="sentences"
        />

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={updateMutation.isPending}
          />
        </View>
      </ScrollView>

      {/* Status picker */}
      <Modal
        visible={showStatusPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowStatusPicker(false)}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>Select Status</Text>
            {STATUS_OPTIONS.map((s) => {
              const clr = statusColor(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusOption, form.status === s && styles.statusOptionActive]}
                  onPress={() => { setForm((p) => ({ ...p, status: s })); setShowStatusPicker(false); }}
                >
                  <View style={[styles.statusDot, { backgroundColor: clr }]} />
                  <Text style={styles.statusOptionLabel}>{formatStatus(s)}</Text>
                  {form.status === s && <MaterialIcons name="check" size={18} color={BRAND.primary} />}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowStatusPicker(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Lender picker */}
      <Modal
        visible={showLenderPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLenderPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Lender</Text>
            <TouchableOpacity onPress={() => setShowLenderPicker(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {lenders.length === 0 ? (
            <View style={styles.modalEmpty}>
              <ActivityIndicator color={BRAND.primary} />
              <Text style={styles.modalEmptyText}>Loading lenders...</Text>
            </View>
          ) : (
            <FlatList
              data={lenders}
              keyExtractor={(l) => l.id}
              renderItem={({ item: l }) => (
                <TouchableOpacity
                  style={styles.listOption}
                  onPress={() => {
                    setForm((p) => ({ ...p, lenderId: l.id, lenderName: l.name }));
                    setShowLenderPicker(false);
                  }}
                >
                  <View style={styles.listOptionIcon}>
                    <MaterialIcons name="account-balance" size={18} color={BRAND.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listOptionName}>{l.name}</Text>
                    <Text style={styles.listOptionSub}>{l.code}</Text>
                  </View>
                  {form.lenderId === l.id && (
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: '#5A7A63', marginTop: 12, fontSize: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 20,
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
  pickerText: { flex: 1, fontSize: 15, color: '#1A2D1E' },
  pickerPlaceholder: { color: '#A0BBA8' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  clearBtn: { alignSelf: 'flex-end', marginBottom: 8 },
  clearBtnText: { fontSize: 12, color: BRAND.primary, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 16 },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  statusOptionActive: { backgroundColor: BRAND.primaryLight },
  statusOptionLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#333' },
  cancelBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { fontSize: 15, color: '#999', fontWeight: '600' },
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
