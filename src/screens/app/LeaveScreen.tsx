import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text as RNText,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import {
  fetchLeaveBalance,
  fetchLeaves,
  applyLeave,
  cancelLeave,
} from '../../services/leaveService';
import { Leave, LeaveApplication, LeaveType } from '../../types/auth';

const LEAVE_TYPES: { key: LeaveType; label: string; color: string }[] = [
  { key: 'CASUAL', label: 'Casual', color: '#3498DB' },
  { key: 'SICK', label: 'Sick', color: '#E74C3C' },
  { key: 'EARNED', label: 'Earned', color: '#27AE60' },
  { key: 'UNPAID', label: 'Unpaid', color: '#95A5A6' },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#F39C12',
  APPROVED: '#27AE60',
  REJECTED: '#E74C3C',
  CANCELLED: '#95A5A6',
};

function BalanceCard({ label, quota, color }: { label: string; quota: { total: number; used: number; remaining: number }; color: string }) {
  const pct = quota.total > 0 ? (quota.used / quota.total) * 100 : 0;
  return (
    <View style={styles.balanceCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <RNText style={styles.balanceLabel}>{label}</RNText>
        <RNText style={[styles.balanceRemaining, { color }]}>{quota.remaining} left</RNText>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
      </View>
      <RNText style={styles.balanceSub}>{quota.used} used of {quota.total} days</RNText>
    </View>
  );
}

function LeaveCard({ item, onCancel }: { item: Leave; onCancel: (id: string) => void }) {
  const statusColor = STATUS_COLOR[item.status] ?? '#5A7A63';
  const typeInfo = LEAVE_TYPES.find((t) => t.key === item.type);
  return (
    <View style={styles.leaveCard}>
      <View style={styles.leaveCardHeader}>
        <View style={[styles.typeChip, { backgroundColor: (typeInfo?.color ?? '#95A5A6') + '18' }]}>
          <RNText style={[styles.typeChipText, { color: typeInfo?.color ?? '#95A5A6' }]}>{typeInfo?.label ?? item.type}</RNText>
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusColor + '18' }]}>
          <RNText style={[styles.statusChipText, { color: statusColor }]}>{item.status}</RNText>
        </View>
      </View>
      <RNText style={styles.leaveDates}>
        {new Date(item.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        {' — '}
        {new Date(item.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        {`  ·  ${item.days} day${item.days !== 1 ? 's' : ''}`}
      </RNText>
      {item.reason ? <RNText style={styles.leaveReason}>{item.reason}</RNText> : null}
      {item.remarks ? <RNText style={styles.leaveRemarks}>Remarks: {item.remarks}</RNText> : null}
      {item.status === 'PENDING' ? (
        <TouchableOpacity onPress={() => onCancel(item.id)} style={styles.cancelBtn}>
          <RNText style={styles.cancelBtnText}>Cancel Leave</RNText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function LeaveScreen() {
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<LeaveApplication>({
    type: 'CASUAL',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  const balanceResult = useQuery({
    queryKey: ['leave', 'balance'],
    queryFn: fetchLeaveBalance,
  }) as any;
  const balance = balanceResult.data;
  const balanceLoading: boolean = balanceResult.isLoading;

  const leavesResult = useQuery({
    queryKey: ['leaves'],
    queryFn: fetchLeaves,
  }) as any;
  const leaves: Leave[] = leavesResult.data ?? [];
  const leavesLoading: boolean = leavesResult.isLoading;
  const refetchLeaves = () => (leavesResult.refetch as () => Promise<any>)();
  const refetchBalance = () => (balanceResult.refetch as () => Promise<any>)();

  const applyMutation = useMutation({
    mutationFn: applyLeave,
    onSuccess: () => {
      setShowModal(false);
      setForm({ type: 'CASUAL', fromDate: '', toDate: '', reason: '' });
      refetchLeaves();
      refetchBalance();
      Alert.alert('Applied', 'Your leave application has been submitted for approval.');
    },
    onError: () => Alert.alert('Error', 'Could not submit leave application. Please try again.'),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelLeave,
    onSuccess: () => {
      refetchLeaves();
      refetchBalance();
    },
    onError: () => Alert.alert('Error', 'Could not cancel leave. Please try again.'),
  });

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Leave', 'Are you sure you want to cancel this leave application?', [
      { text: 'No', style: 'cancel' },
      { text: 'Cancel Leave', style: 'destructive', onPress: () => cancelMutation.mutate(id) },
    ]);
  };

  const handleSubmit = () => {
    if (!form.fromDate || !form.toDate || !form.reason.trim()) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }
    applyMutation.mutate(form);
  };

  const applyLoading = (applyMutation as any).isPending;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Leave Balance */}
      <View style={styles.sectionRow}>
        <RNText style={styles.sectionTitle}>Leave Balance</RNText>
        <TouchableOpacity style={styles.applyBtn} onPress={() => setShowModal(true)}>
          <MaterialIcons name="add" size={16} color="#FFF" />
          <RNText style={styles.applyBtnText}>Apply</RNText>
        </TouchableOpacity>
      </View>

      {balanceLoading ? (
        <ActivityIndicator color={BRAND.primary} style={{ marginVertical: 16 }} />
      ) : balance ? (
        <View style={styles.balanceGrid}>
          <BalanceCard label="Casual Leave" quota={balance.casual} color="#3498DB" />
          <BalanceCard label="Sick Leave" quota={balance.sick} color="#E74C3C" />
          <BalanceCard label="Earned Leave" quota={balance.earned} color="#27AE60" />
          <BalanceCard label="Unpaid Leave" quota={balance.unpaid} color="#95A5A6" />
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <RNText style={styles.emptyText}>Leave balance unavailable</RNText>
        </View>
      )}

      {/* Leave History */}
      <RNText style={[styles.sectionTitle, { marginTop: 24 }]}>My Leaves</RNText>
      {leavesLoading ? (
        <ActivityIndicator color={BRAND.primary} style={{ marginVertical: 16 }} />
      ) : leaves.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="event-note" size={36} color="#C8DFD0" />
          <RNText style={styles.emptyText}>No leave applications yet</RNText>
        </View>
      ) : (
        leaves.map((item) => <LeaveCard key={item.id} item={item} onCancel={handleCancel} />)
      )}

      {/* Apply Leave Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <RNText style={styles.modalTitle}>Apply for Leave</RNText>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={22} color="#1A2D1E" />
              </TouchableOpacity>
            </View>

            <RNText style={styles.fieldLabel}>Leave Type</RNText>
            <View style={styles.typeRow}>
              {LEAVE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeBtn, form.type === t.key && { backgroundColor: t.color }]}
                  onPress={() => setForm((f) => ({ ...f, type: t.key }))}
                >
                  <RNText style={[styles.typeBtnText, form.type === t.key && { color: '#FFF' }]}>{t.label}</RNText>
                </TouchableOpacity>
              ))}
            </View>

            <RNText style={styles.fieldLabel}>From Date (YYYY-MM-DD)</RNText>
            <TextInput
              style={styles.input}
              value={form.fromDate}
              onChangeText={(v) => setForm((f) => ({ ...f, fromDate: v }))}
              placeholder="e.g. 2025-06-20"
              placeholderTextColor="#B0C8B8"
              keyboardType="numeric"
            />

            <RNText style={styles.fieldLabel}>To Date (YYYY-MM-DD)</RNText>
            <TextInput
              style={styles.input}
              value={form.toDate}
              onChangeText={(v) => setForm((f) => ({ ...f, toDate: v }))}
              placeholder="e.g. 2025-06-22"
              placeholderTextColor="#B0C8B8"
              keyboardType="numeric"
            />

            <RNText style={styles.fieldLabel}>Reason</RNText>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.reason}
              onChangeText={(v) => setForm((f) => ({ ...f, reason: v }))}
              placeholder="Enter reason for leave"
              placeholderTextColor="#B0C8B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, applyLoading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={applyLoading}
            >
              {applyLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <RNText style={styles.submitBtnText}>Submit Application</RNText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 4,
  },
  applyBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  balanceGrid: { gap: 10 },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  balanceLabel: { fontSize: 13, fontWeight: '600', color: '#1A2D1E' },
  balanceRemaining: { fontSize: 14, fontWeight: '800' },
  progressBg: { height: 6, backgroundColor: '#E8F5EE', borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  balanceSub: { fontSize: 11, color: '#5A7A63' },
  leaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  leaveCardHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  typeChipText: { fontSize: 11, fontWeight: '700' },
  statusChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  leaveDates: { fontSize: 13, color: '#1A2D1E', fontWeight: '600', marginBottom: 4 },
  leaveReason: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
  leaveRemarks: { fontSize: 12, color: BRAND.primary, marginTop: 4, fontStyle: 'italic' },
  cancelBtn: { marginTop: 10, alignSelf: 'flex-start' },
  cancelBtnText: { color: '#E74C3C', fontSize: 12, fontWeight: '700' },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { color: '#5A7A63', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A2D1E' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#5A7A63', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.4 },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F0F7F3',
    borderWidth: 1,
    borderColor: '#C8DFD0',
  },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: '#1A2D1E' },
  input: {
    borderWidth: 1,
    borderColor: '#C8DFD0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A2D1E',
    backgroundColor: '#FAFCFB',
  },
  inputMultiline: { height: 80, paddingTop: 10 },
  submitBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
