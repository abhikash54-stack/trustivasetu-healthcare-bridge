import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  Text as RNText,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { invalidateQueries } from '../../api/queryClient';
import { MaterialIcons } from '@expo/vector-icons';

import { fetchLeadById, updateLeadStatus } from '../../services/leadService';
import { useNavigation } from '@react-navigation/native';
import { LeadDetail } from '../../types/auth';
import { Text, Box } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';
import { BRAND } from '../../theme/theme';
import { formatDate, formatCurrency, statusColor, formatStatus } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';

interface LeadDetailsScreenProps {
  route: { params: { leadId: string } };
}

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'DISBURSED', 'REJECTED', 'CANCELLED'];

const STATUS_UPDATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'REGIONAL_MANAGER'];

export function LeadDetailsScreen({ route }: LeadDetailsScreenProps) {
  const { leadId } = route.params;
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [showStatusModal, setShowStatusModal] = useState(false);

  const queryResult = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => fetchLeadById(leadId),
  }) as any;
  const lead = queryResult.data as LeadDetail | undefined;
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)();

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateLeadStatus(leadId, status),
    onSuccess: () => {
      invalidateQueries(['lead', leadId], ['leads']);
      setShowStatusModal(false);
      Alert.alert('Updated', 'Lead status has been updated.');
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        'Could not update status. Please try again.';
      Alert.alert('Error', msg);
    },
  });

  const canUpdateStatus = STATUS_UPDATE_ROLES.includes(user?.role?.toUpperCase() ?? '');

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND.primary} size="large" />
        <RNText style={styles.loadingText}>Loading lead details...</RNText>
      </View>
    );
  }

  if (isError || !lead) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={48} color="#E74C3C" />
        <RNText style={styles.errorText}>Could not load lead</RNText>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <RNText style={styles.retryBtnText}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const color = statusColor(lead.status);

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <RNText style={styles.applicantName}>{lead.applicantName || '—'}</RNText>
          <RNText style={styles.clinicName}>{lead.clinicName || 'No channel partner'}</RNText>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: color + '25', borderColor: color }]}>
              <RNText style={[styles.statusText, { color }]}>{formatStatus(lead.status)}</RNText>
            </View>
            {lead.source ? (
              <View style={styles.sourceBadge}>
                <RNText style={styles.sourceText}>{formatStatus(lead.source)}</RNText>
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            {canUpdateStatus && (
              <TouchableOpacity
                style={styles.updateStatusBtn}
                onPress={() => setShowStatusModal(true)}
              >
                <MaterialIcons name="swap-horiz" size={15} color={BRAND.primary} />
                <RNText style={styles.updateStatusText}>Update Status</RNText>
              </TouchableOpacity>
            )}
            {canUpdateStatus && (
              <TouchableOpacity
                style={[styles.updateStatusBtn, { borderColor: '#8E44AD' }]}
                onPress={() => navigation.navigate('EditLead', { leadId })}
              >
                <MaterialIcons name="edit" size={15} color="#8E44AD" />
                <RNText style={[styles.updateStatusText, { color: '#8E44AD' }]}>Edit Lead</RNText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <SectionCard title="Financial Summary">
          <DetailRow label="Applied Amount" value={formatCurrency(lead.amount)} />
          <DetailRow label="Approved Amount" value={formatCurrency(lead.approvedAmount)} />
          <DetailRow label="Disbursed Amount" value={formatCurrency(lead.disbursedAmount)} />
          <DetailRow label="Lender" value={lead.lenderName || '—'} />
        </SectionCard>

        <SectionCard title="Timeline">
          <DetailRow label="Application Date" value={formatDate(lead.applicationDate)} />
          <DetailRow label="Approval Date" value={formatDate(lead.approvalDate)} />
          <DetailRow label="Disbursal Date" value={formatDate(lead.disbursalDate)} />
          <DetailRow label="Last Updated" value={formatDate(lead.updatedAt)} />
        </SectionCard>

        <SectionCard title="Contact Details">
          <DetailRow label="Phone" value={lead.phone || '—'} />
          <DetailRow label="Email" value={lead.email || '—'} />
          <DetailRow label="Stage" value={lead.stage || '—'} />
          <DetailRow label="Assigned To" value={lead.assignedTo || '—'} />
        </SectionCard>

        {lead.statusHistory.length > 0 ? (
          <SectionCard title="Status History">
            {lead.statusHistory.map((h, i) => (
              <Box
                key={`${h.status}-${i}`}
                marginBottom={i < lead.statusHistory.length - 1 ? 'sm' : 'xs'}
                style={i < lead.statusHistory.length - 1 ? styles.historyItem : undefined}
              >
                <View style={styles.historyRow}>
                  <View style={[styles.historyDot, { backgroundColor: statusColor(h.status) }]} />
                  <View style={{ flex: 1 }}>
                    <Text variant="body">{formatStatus(h.status)}</Text>
                    <Text variant="secondary">{formatDate(h.updatedAt)}</Text>
                    {h.note ? <Text variant="secondary">{h.note}</Text> : null}
                  </View>
                </View>
              </Box>
            ))}
          </SectionCard>
        ) : null}

        {lead.remarks ? (
          <SectionCard title="Remarks">
            <Text variant="body">{lead.remarks}</Text>
          </SectionCard>
        ) : null}
      </ScrollView>

      {/* Status update modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.bottomSheet}>
            <RNText style={styles.sheetTitle}>Update Lead Status</RNText>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  lead.status?.toUpperCase() === s && styles.statusOptionActive,
                ]}
                onPress={() => statusMutation.mutate(s)}
                disabled={statusMutation.isPending}
              >
                <View style={[styles.statusDot, { backgroundColor: statusColor(s) }]} />
                <RNText style={styles.statusOptionLabel}>{formatStatus(s)}</RNText>
                {lead.status?.toUpperCase() === s && (
                  <MaterialIcons name="check" size={18} color={BRAND.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowStatusModal(false)}
            >
              <RNText style={styles.cancelBtnText}>Cancel</RNText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <RNText style={styles.detailLabel}>{label}</RNText>
      <RNText style={styles.detailValue}>{value || '—'}</RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7F3' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: '#5A7A63', marginTop: 12, fontSize: 14 },
  errorText: { color: '#E74C3C', fontSize: 15, fontWeight: '600', marginTop: 12 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  applicantName: { fontSize: 20, fontWeight: '800', color: '#1A2D1E', letterSpacing: -0.3 },
  clinicName: { fontSize: 13, color: '#5A7A63', marginTop: 4, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  sourceBadge: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8DFD0',
    backgroundColor: '#F0F7F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sourceText: { fontSize: 12, fontWeight: '600', color: '#5A7A63' },
  updateStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
  },
  updateStatusText: { fontSize: 13, fontWeight: '600', color: BRAND.primary },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
  },
  detailLabel: { fontSize: 13, color: '#5A7A63', fontWeight: '500', flex: 1 },
  detailValue: { fontSize: 13, color: '#1A2D1E', fontWeight: '600', textAlign: 'right', flex: 1 },
  historyItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
  },
  historyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
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
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusOptionLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#333' },
  cancelBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { fontSize: 15, color: '#999', fontWeight: '600' },
});
