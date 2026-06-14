import React, { useState, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Text as RNText,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { fetchClinics } from '../../services/clinicService';
import { Clinic } from '../../types/auth';
import { BRAND } from '../../theme/theme';
import { statusColor, formatStatus } from '../../utils/format';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'INACTIVE'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function ClinicCard({ item, onPress }: { item: Clinic; onPress: () => void }) {
  const color = statusColor(item.status);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="local-hospital" size={22} color={BRAND.primary} />
        </View>
        <View style={styles.cardTitleWrap}>
          <RNText style={styles.cardName} numberOfLines={1}>{item.name || '—'}</RNText>
          <RNText style={styles.cardLocation} numberOfLines={1}>
            {item.location || 'Location not set'}
          </RNText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color + '20', borderColor: color }]}>
          <RNText style={[styles.statusText, { color }]}>{formatStatus(item.status)}</RNText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ClinicsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const queryResult = useQuery({ queryKey: ['clinics'], queryFn: fetchClinics }) as any;
  const clinics: Clinic[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)().finally(() => setRefreshing(false));

  const filtered = useMemo(() => {
    let result = clinics;
    if (activeFilter !== 'ALL') {
      result = result.filter((c) => c.status?.toUpperCase() === activeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q),
      );
    }
    return result;
  }, [clinics, activeFilter, search]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND.primary} size="large" />
        <RNText style={styles.loadingText}>Loading channel partners...</RNText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
        <RNText style={styles.errorText}>Could not load channel partners</RNText>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <RNText style={styles.retryBtnText}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const totalActive = clinics.filter((c) => c.status?.toUpperCase() === 'ACTIVE').length;
  const totalInactive = clinics.filter((c) => c.status?.toUpperCase() === 'INACTIVE').length;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Stats cards */}
      {clinics.length > 0 && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: BRAND.primary }]}>
            <MaterialIcons name="business" size={16} color={BRAND.primary} />
            <RNText style={[styles.statValue, { color: BRAND.primary }]}>{clinics.length}</RNText>
            <RNText style={styles.statLabel}>Total</RNText>
          </View>
          <View style={[styles.statCard, { borderTopColor: '#27AE60' }]}>
            <MaterialIcons name="check-circle" size={16} color="#27AE60" />
            <RNText style={[styles.statValue, { color: '#27AE60' }]}>{totalActive}</RNText>
            <RNText style={styles.statLabel}>Active</RNText>
          </View>
          <View style={[styles.statCard, { borderTopColor: '#E67E22' }]}>
            <MaterialIcons name="pause-circle" size={16} color="#E67E22" />
            <RNText style={[styles.statValue, { color: '#E67E22' }]}>{totalInactive}</RNText>
            <RNText style={styles.statLabel}>Inactive</RNText>
          </View>
          <View style={[styles.statCard, { borderTopColor: '#8E44AD' }]}>
            <MaterialIcons name="filter-list" size={16} color="#8E44AD" />
            <RNText style={[styles.statValue, { color: '#8E44AD' }]}>{filtered.length}</RNText>
            <RNText style={styles.statLabel}>Showing</RNText>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color="#5A7A63" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search partners..."
          placeholderTextColor="#A0BBA8"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={STATUS_FILTERS as unknown as StatusFilter[]}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <RNText style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f === 'ALL' ? 'All' : formatStatus(f)}
            </RNText>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="business" size={48} color="#C8DFD0" />
          <RNText style={styles.emptyTitle}>
            {clinics.length === 0 ? 'No partners yet' : 'No results'}
          </RNText>
          <RNText style={styles.emptyHint}>
            {clinics.length === 0
              ? 'Channel partners will appear here once onboarded.'
              : 'Try a different search or filter.'}
          </RNText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClinicCard
              item={item}
              onPress={() => navigation.navigate('ClinicDetails', { clinicId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); refetch(); }}
              tintColor={BRAND.primary}
            />
          }
          ListFooterComponent={
            <RNText style={styles.countText}>
              {filtered.length} partner{filtered.length !== 1 ? 's' : ''}
            </RNText>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateClinic')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    gap: 3,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#5A7A63', fontWeight: '600', textAlign: 'center' },
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DCF0E4',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#1A2D1E' },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C8DFD0',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: BRAND.primary,
    borderColor: BRAND.primary,
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#5A7A63' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, gap: 12, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1A2D1E' },
  cardLocation: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1A2D1E', marginTop: 14 },
  emptyHint: { fontSize: 13, color: '#5A7A63', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  countText: { textAlign: 'center', color: '#A0BBA8', fontSize: 12, paddingVertical: 8 },
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
});
