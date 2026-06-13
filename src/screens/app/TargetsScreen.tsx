import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { invalidateQueries } from '../../api/queryClient';
import { BRAND } from '../../theme/theme';
import { Target, Region } from '../../types/auth';
import { fetchTargets, upsertTarget, UpsertTargetInput } from '../../services/targetsService';
import { fetchRegions } from '../../services/regionsService';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const now = new Date();

export function TargetsScreen() {
  const { user } = useAuth();
  const canCreate = ADMIN_ROLES.includes(user?.role?.toUpperCase() ?? '');

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({ leadsTarget: '', disbursalTarget: '', regionId: '' });

  const queryResult = useQuery<Target[]>({
    queryKey: ['targets', year, month],
    queryFn: () => fetchTargets(year, month),
  }) as any;
  const targets: Target[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const refetch = () => (queryResult.refetch as () => Promise<any>)().finally(() => setRefreshing(false));

  const regionsResult = useQuery<Region[]>({ queryKey: ['regions'], queryFn: fetchRegions }) as any;
  const regions: Region[] = regionsResult.data ?? [];

  const upsertMutation = useMutation({
    mutationFn: (input: UpsertTargetInput) => upsertTarget(input),
    onSuccess: () => {
      invalidateQueries(['targets', year, month]);
      setShowModal(false);
      setForm({ leadsTarget: '', disbursalTarget: '', regionId: '' });
      Alert.alert('Target saved', 'The target has been saved successfully.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message ?? 'Could not save target.');
    },
  });

  const handleSave = () => {
    if (!form.leadsTarget.trim()) return Alert.alert('Required', 'Enter a leads target.');
    if (!form.disbursalTarget.trim()) return Alert.alert('Required', 'Enter a disbursal target.');
    const input: UpsertTargetInput = {
      year,
      month,
      leadsTarget: Number(form.leadsTarget),
      disbursalTarget: Number(form.disbursalTarget),
    };
    if (form.regionId.trim()) input.regionId = form.regionId;
    upsertMutation.mutate(input);
  };

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Targets</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <MaterialIcons name="chevron-left" size={22} color={BRAND.primary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTH_NAMES[month - 1]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <MaterialIcons name="chevron-right" size={22} color={BRAND.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={targets}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); refetch(); }}
              tintColor={BRAND.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialIcons name="track-changes" size={40} color="#C8DFD0" />
              <Text style={styles.emptyText}>No targets for {MONTH_NAMES[month - 1]} {year}</Text>
            </View>
          }
          renderItem={({ item: t }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="track-changes" size={20} color={BRAND.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {t.region?.name ?? t.user?.name ?? t.clinic?.name ?? 'Overall'}
                  </Text>
                  <Text style={styles.cardSub}>
                    {t.region ? 'Region' : t.user ? 'User' : t.clinic ? 'Clinic' : 'General'} Target
                  </Text>
                </View>
              </View>
              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Leads Target</Text>
                  <Text style={styles.metricValue}>{t.leadsTarget}</Text>
                </View>
                <View style={[styles.metricBox, styles.metricBoxMiddle]}>
                  <Text style={styles.metricLabel}>Disbursal</Text>
                  <Text style={[styles.metricValue, { color: '#3498DB' }]}>
                    {formatCurrency(t.disbursalTarget)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {canCreate && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Set Target — {MONTH_NAMES[month - 1]} {year}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FormInput
              label="Leads Target *"
              placeholder="e.g. 50"
              keyboardType="numeric"
              value={form.leadsTarget}
              onChangeText={(v) => setForm((p) => ({ ...p, leadsTarget: v }))}
            />
            <FormInput
              label="Disbursal Target (₹) *"
              placeholder="e.g. 5000000"
              keyboardType="numeric"
              value={form.disbursalTarget}
              onChangeText={(v) => setForm((p) => ({ ...p, disbursalTarget: v }))}
            />
            <Text style={styles.fieldLabel}>Region (optional)</Text>
            <View style={styles.regionChips}>
              <TouchableOpacity
                style={[styles.chip, !form.regionId && styles.chipActive]}
                onPress={() => setForm((p) => ({ ...p, regionId: '' }))}
              >
                <Text style={[styles.chipText, !form.regionId && styles.chipTextActive]}>Overall</Text>
              </TouchableOpacity>
              {regions.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.chip, form.regionId === r.id && styles.chipActive]}
                  onPress={() => setForm((p) => ({ ...p, regionId: r.id }))}
                >
                  <Text style={[styles.chipText, form.regionId === r.id && styles.chipTextActive]}>{r.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 16 }}>
              <PrimaryButton
                label={upsertMutation.isPending ? 'Saving...' : 'Save Target'}
                onPress={handleSave}
                disabled={upsertMutation.isPending}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 10 },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: { padding: 4 },
  monthLabel: { fontSize: 15, fontWeight: '700', color: BRAND.primary },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: BRAND.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A2D1E' },
  cardSub: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
  metricsRow: { flexDirection: 'row', gap: 1 },
  metricBox: { flex: 1, paddingVertical: 8, paddingHorizontal: 4 },
  metricBoxMiddle: { borderLeftWidth: 1, borderLeftColor: '#F0F7F3', paddingLeft: 16 },
  metricLabel: { fontSize: 11, color: '#5A7A63', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  metricValue: { fontSize: 18, fontWeight: '800', color: '#1A2D1E', marginTop: 4 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: '#999', fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalContent: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E', flex: 1, marginRight: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 8 },
  regionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
});
