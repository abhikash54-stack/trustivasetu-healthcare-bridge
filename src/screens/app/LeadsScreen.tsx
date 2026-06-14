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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { fetchLeads } from '../../services/leadService';
import { Lead } from '../../types/auth';
import { BRAND } from '../../theme/theme';
import { formatDate, formatCurrency, statusColor, formatStatus } from '../../utils/format';
import { downloadAndShareExport } from '../../utils/nativeExport';
import { ListSkeleton } from '../../components/SkeletonLoader';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'DISBURSED', 'REJECTED', 'CANCELLED'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function LeadCard({ item, onPress }: { item: Lead; onPress: () => void }) {
  const color = statusColor(item.status);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <RNText style={styles.cardName} numberOfLines={1}>{item.applicantName || '—'}</RNText>
          <RNText style={styles.cardClinic} numberOfLines={1}>{item.clinicName || 'No partner'}</RNText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color + '20', borderColor: color }]}>
          <RNText style={[styles.statusText, { color }]}>{formatStatus(item.status)}</RNText>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name="person-outline" size={13} color="#5A7A63" />
          <RNText style={styles.metaText}>{item.assignedTo || 'Unassigned'}</RNText>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="account-balance-wallet" size={13} color="#5A7A63" />
          <RNText style={styles.metaText}>{formatCurrency(item.amount)}</RNText>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="access-time" size={13} color="#5A7A63" />
          <RNText style={styles.metaText}>{formatDate(item.updatedAt)}</RNText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function LeadsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const serverStatus = activeFilter !== 'ALL' ? activeFilter : undefined;
  const queryResult = useQuery({
    queryKey: ['leads', serverStatus, dateFrom, dateTo],
    queryFn: () => fetchLeads({ status: serverStatus, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
  }) as any;
  const leads: Lead[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)().finally(() => setRefreshing(false));

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.trim().toLowerCase();
    return leads.filter(
      (l) =>
        l.applicantName.toLowerCase().includes(q) ||
        l.clinicName.toLowerCase().includes(q) ||
        l.assignedTo.toLowerCase().includes(q),
    );
  }, [leads, search]);

  function handleExport() {
    downloadAndShareExport('leads');
  }

  const hasDateFilter = !!(dateFrom || dateTo);

  if (isLoading) {
    return <ListSkeleton rows={6} />;
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
        <RNText style={styles.errorText}>Could not load leads</RNText>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <RNText style={styles.retryBtnText}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Search + action row */}
      <View style={styles.topRow}>
        <View style={[styles.searchWrap, { flex: 1 }]}>
          <MaterialIcons name="search" size={20} color="#5A7A63" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads..."
            placeholderTextColor="#A0BBA8"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={[styles.iconActionBtn, hasDateFilter && styles.iconActionBtnActive]}
          onPress={() => setShowDateFilter(v => !v)}
        >
          <MaterialIcons name="date-range" size={20} color={hasDateFilter ? '#FFF' : BRAND.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconActionBtn} onPress={handleExport}>
          <MaterialIcons name="file-download" size={20} color={BRAND.primary} />
        </TouchableOpacity>
      </View>

      {/* Date filter panel */}
      {showDateFilter && (
        <View style={styles.dateFilterPanel}>
          <View style={styles.dateFilterRow}>
            <View style={styles.dateField}>
              <RNText style={styles.dateLabel}>From (YYYY-MM-DD)</RNText>
              <TextInput
                style={styles.dateInput}
                placeholder="2025-01-01"
                placeholderTextColor="#A0BBA8"
                value={dateFrom}
                onChangeText={setDateFrom}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.dateField}>
              <RNText style={styles.dateLabel}>To (YYYY-MM-DD)</RNText>
              <TextInput
                style={styles.dateInput}
                placeholder="2025-12-31"
                placeholderTextColor="#A0BBA8"
                value={dateTo}
                onChangeText={setDateTo}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          {hasDateFilter && (
            <TouchableOpacity onPress={() => { setDateFrom(''); setDateTo(''); }}>
              <RNText style={styles.clearDates}>Clear dates</RNText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Status filter chips */}
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
          <MaterialIcons name="inbox" size={48} color="#C8DFD0" />
          <RNText style={styles.emptyTitle}>
            {leads.length === 0 ? 'No leads yet' : 'No results'}
          </RNText>
          <RNText style={styles.emptyHint}>
            {leads.length === 0
              ? 'Leads submitted through partner clinics will appear here.'
              : 'Try a different search or filter.'}
          </RNText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeadCard
              item={item}
              onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}
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
            <RNText style={styles.countText}>{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</RNText>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLead')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    gap: 8,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DCF0E4',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#1A2D1E' },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCF0E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtnActive: {
    backgroundColor: BRAND.primary,
    borderColor: BRAND.primary,
  },
  dateFilterPanel: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCF0E4',
    marginBottom: 4,
  },
  dateFilterRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1 },
  dateLabel: { fontSize: 11, fontWeight: '600', color: '#5A7A63', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#C8DFD0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1A2D1E',
  },
  clearDates: { color: BRAND.primary, fontSize: 12, fontWeight: '600', textAlign: 'right', marginTop: 8 },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitleWrap: { flex: 1, marginRight: 10 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1A2D1E' },
  cardClinic: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#5A7A63', fontWeight: '500' },
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
