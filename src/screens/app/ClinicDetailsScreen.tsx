import React from 'react';
import { Alert, ScrollView, StyleSheet, View, TouchableOpacity, Text as RNText, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { fetchClinicById, deleteClinic } from '../../services/clinicService';
import { ClinicDetail } from '../../types/auth';
import { Text, Box } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';
import { BRAND } from '../../theme/theme';
import { formatCurrency, statusColor, formatStatus } from '../../utils/format';
import { RootState } from '../../store';

const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN'];

interface ClinicDetailsScreenProps {
  route: { params: { clinicId: string } };
}

export function ClinicDetailsScreen({ route }: ClinicDetailsScreenProps) {
  const { clinicId } = route.params;
  const navigation = useNavigation<any>();
  const role = useSelector((s: RootState) => s.auth.user?.role ?? '');
  const canDelete = DELETE_ROLES.includes(role);

  const deleteMutation = useMutation({
    mutationFn: () => deleteClinic(clinicId),
    onSuccess: () => {
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.error ?? 'Could not delete clinic.');
    },
  });

  const confirmDelete = () => {
    Alert.alert(
      'Delete Partner',
      'This will permanently remove this channel partner. All associated leads will be retained. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  };

  const queryResult = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => fetchClinicById(clinicId),
  }) as any;
  const clinic = queryResult.data as ClinicDetail | undefined;
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND.primary} size="large" />
        <RNText style={styles.loadingText}>Loading partner details...</RNText>
      </View>
    );
  }

  if (isError || !clinic) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={48} color="#E74C3C" />
        <RNText style={styles.errorText}>Could not load partner</RNText>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <RNText style={styles.retryBtnText}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const color = statusColor(clinic.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <View style={styles.headerIconWrap}>
          <MaterialIcons name="local-hospital" size={28} color={BRAND.primary} />
        </View>
        <RNText style={styles.clinicName}>{clinic.name}</RNText>
        <RNText style={styles.location}>{clinic.location || '—'}</RNText>
        <View style={[styles.statusBadge, { backgroundColor: color + '25', borderColor: color }]}>
          <RNText style={[styles.statusText, { color }]}>{formatStatus(clinic.status)}</RNText>
        </View>
      </View>

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnOutline]}
          onPress={() => navigation.navigate('RMAssignment', { clinicId: clinic.id })}
        >
          <MaterialIcons name="person-add" size={16} color={BRAND.primary} />
          <RNText style={styles.actionBtnText}>Assign RM</RNText>
        </TouchableOpacity>
        {canDelete && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={confirmDelete}
            disabled={deleteMutation.isPending}
          >
            <MaterialIcons name="delete" size={16} color="#E74C3C" />
            <RNText style={[styles.actionBtnText, { color: '#E74C3C' }]}>
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </RNText>
          </TouchableOpacity>
        )}
      </View>

      <SectionCard title="Partner Information">
        <DetailRow label="Assigned RM" value={clinic.assignedRM || 'Not assigned'} />
        <DetailRow label="Business Potential" value={formatCurrency(clinic.businessPotential)} />
        <DetailRow label="Status" value={formatStatus(clinic.status)} />
      </SectionCard>

      <SectionCard title="Contact Details">
        <DetailRow label="Address" value={clinic.address || '—'} />
        <DetailRow label="Contact Person" value={clinic.contactPerson || '—'} />
        <DetailRow label="Phone" value={clinic.contactNumber || '—'} />
        <DetailRow label="Email" value={clinic.email || '—'} />
      </SectionCard>

      {clinic.currentTargets.leadsTarget > 0 || clinic.currentTargets.disbursalTarget ? (
        <SectionCard title="Monthly Targets">
          <View style={styles.targetHeader}>
            <RNText style={styles.targetMonth}>
              {clinic.currentTargets.month} {clinic.currentTargets.year}
            </RNText>
          </View>
          <View style={styles.targetsGrid}>
            <TargetBlock
              label="Leads Target"
              target={String(clinic.currentTargets.leadsTarget)}
              achieved={String(clinic.currentTargets.achievedLeads)}
            />
            <TargetBlock
              label="Disbursal Target"
              target={formatCurrency(clinic.currentTargets.disbursalTarget)}
              achieved={formatCurrency(clinic.currentTargets.achievedDisbursal)}
            />
          </View>
        </SectionCard>
      ) : null}

      {clinic.recentLeads.length > 0 ? (
        <SectionCard title="Recent Leads">
          {clinic.recentLeads.map((lead) => (
            <Box key={lead.id} marginBottom="sm">
              <Text variant="body">{lead.applicantName}</Text>
              <Text variant="secondary">{formatStatus(lead.status)}</Text>
            </Box>
          ))}
        </SectionCard>
      ) : null}

      {clinic.notes ? (
        <SectionCard title="Notes">
          <Text variant="body">{clinic.notes}</Text>
        </SectionCard>
      ) : null}
    </ScrollView>
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

function TargetBlock({ label, target, achieved }: { label: string; target: string; achieved: string }) {
  return (
    <View style={styles.targetBlock}>
      <RNText style={styles.targetLabel}>{label}</RNText>
      <RNText style={styles.targetValue}>{target}</RNText>
      <RNText style={styles.targetAchieved}>Achieved: {achieved}</RNText>
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
    marginBottom: 12,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  headerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  clinicName: { fontSize: 20, fontWeight: '800', color: '#1A2D1E', letterSpacing: -0.3 },
  location: { fontSize: 13, color: '#5A7A63', marginTop: 4, marginBottom: 12 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
  },
  actionBtnOutline: { borderColor: BRAND.primary },
  actionBtnDanger: { borderColor: '#E74C3C' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: BRAND.primary },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
  },
  detailLabel: { fontSize: 13, color: '#5A7A63', fontWeight: '500', flex: 1 },
  detailValue: { fontSize: 13, color: '#1A2D1E', fontWeight: '600', textAlign: 'right', flex: 1 },
  targetHeader: { marginBottom: 12 },
  targetMonth: { fontSize: 13, fontWeight: '600', color: '#5A7A63' },
  targetsGrid: { flexDirection: 'row', gap: 12 },
  targetBlock: { flex: 1, backgroundColor: BRAND.primaryLight, borderRadius: 10, padding: 12 },
  targetLabel: { fontSize: 11, color: '#5A7A63', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  targetValue: { fontSize: 18, fontWeight: '800', color: '#1A2D1E', marginTop: 4 },
  targetAchieved: { fontSize: 12, color: BRAND.primary, fontWeight: '600', marginTop: 4 },
});
