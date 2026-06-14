import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { BRAND } from '../../theme/theme';
import { AuditLog } from '../../types/auth';
import { fetchAuditLogs } from '../../services/auditLogService';
import { formatDate } from '../../utils/format';
import { usePermissionGuard } from '../../hooks/usePermissionGuard';

const ENTITY_FILTERS = ['All', 'Lead', 'Clinic', 'User', 'Target', 'Region', 'Lender'];
const ACTION_FILTERS = ['All', 'Create', 'Update', 'Delete', 'Status Change', 'Login', 'Logout'];

const ACTION_COLORS: Record<string, string> = {
  CREATE: '#27AE60',
  UPDATE: '#3498DB',
  DELETE: '#E74C3C',
  STATUS_CHANGE: '#8E44AD',
  LOGIN: '#F39C12',
  LOGOUT: '#95A5A6',
};

function actionColor(action: string): string {
  const upper = action?.toUpperCase() ?? '';
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (upper.includes(key)) return color;
  }
  return '#5A7A63';
}

function actionApiValue(label: string): string | undefined {
  if (label === 'All') return undefined;
  return label.toUpperCase().replace(/ /g, '_');
}

export function AuditLogsScreen() {
  usePermissionGuard(['SUPER_ADMIN', 'ADMIN']);
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const hasDateFilter = !!(dateFrom || dateTo);

  const queryResult = useQuery({
    queryKey: ['audit-logs', entityFilter, actionFilter, dateFrom, dateTo, page],
    queryFn: () =>
      fetchAuditLogs({
        page,
        entity: entityFilter !== 'All' ? entityFilter.toUpperCase() : undefined,
        action: actionApiValue(actionFilter),
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  }) as any;

  const data = queryResult.data as { logs: AuditLog[]; total: number; page: number } | undefined;
  const logs: AuditLog[] = data?.logs ?? [];
  const total: number = data?.total ?? 0;
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)().finally(() => setRefreshing(false));

  const hasMore = logs.length < total;

  const handleEntityFilter = (f: string) => { setEntityFilter(f); setPage(1); };
  const handleActionFilter = (f: string) => { setActionFilter(f); setPage(1); };
  const clearDateFilter = () => { setDateFrom(''); setDateTo(''); setPage(1); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Audit Logs</Text>
          <Text style={styles.headerSub}>{total} event{total !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={[styles.dateFilterBtn, hasDateFilter && styles.dateFilterBtnActive]}
          onPress={() => setShowDateModal(true)}
        >
          <MaterialIcons name="date-range" size={16} color={hasDateFilter ? '#FFF' : BRAND.primary} />
          <Text style={[styles.dateFilterBtnText, hasDateFilter && { color: '#FFF' }]}>
            {hasDateFilter ? 'Filtered' : 'Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Entity filter chips */}
      <View style={[styles.filterBar, { paddingBottom: 6 }]}>
        {ENTITY_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, entityFilter === f && styles.filterChipActive]}
            onPress={() => handleEntityFilter(f)}
          >
            <Text style={[styles.filterChipText, entityFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action filter chips */}
      <View style={[styles.filterBar, { borderTopWidth: 1, borderTopColor: '#F0F7F3', paddingTop: 6 }]}>
        {ACTION_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, actionFilter === f && styles.filterChipActionActive]}
            onPress={() => handleActionFilter(f)}
          >
            <Text style={[styles.filterChipText, actionFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {hasDateFilter && (
        <View style={styles.activeDateRow}>
          <Text style={styles.activeDateText}>
            {dateFrom && `From: ${dateFrom}`}{dateFrom && dateTo ? '  · ' : ''}{dateTo && `To: ${dateTo}`}
          </Text>
          <TouchableOpacity onPress={clearDateFilter}>
            <MaterialIcons name="close" size={16} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      )}

      {/* Date filter modal */}
      <Modal visible={showDateModal} transparent animationType="slide" onRequestClose={() => setShowDateModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDateModal(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Filter by Date Range</Text>
          <Text style={styles.modalHint}>Format: YYYY-MM-DD</Text>
          <Text style={styles.modalFieldLabel}>From Date</Text>
          <TextInput
            style={styles.modalInput}
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholder="2025-01-01"
            placeholderTextColor="#B0C8B8"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <Text style={styles.modalFieldLabel}>To Date</Text>
          <TextInput
            style={styles.modalInput}
            value={dateTo}
            onChangeText={setDateTo}
            placeholder="2025-12-31"
            placeholderTextColor="#B0C8B8"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearBtn} onPress={() => { clearDateFilter(); setShowDateModal(false); }}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={() => { setPage(1); setShowDateModal(false); }}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isLoading && page === 1 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
          <Text style={styles.errorText}>Could not load audit logs</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); setPage(1); refetch(); }}
              tintColor={BRAND.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialIcons name="history" size={40} color="#C8DFD0" />
              <Text style={styles.emptyText}>No audit logs found</Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={BRAND.primary} size="small" />
                ) : (
                  <Text style={styles.loadMoreText}>Load more</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item: log }) => {
            const color = actionColor(log.action);
            return (
              <View style={styles.logCard}>
                <View style={[styles.actionDot, { backgroundColor: color }]} />
                <View style={styles.logBody}>
                  <View style={styles.logTop}>
                    <View style={[styles.actionBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[styles.actionLabel, { color }]}>
                        {log.action?.replace(/_/g, ' ') ?? '—'}
                      </Text>
                    </View>
                    <Text style={styles.entityLabel}>
                      {log.entity}
                      {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}
                    </Text>
                  </View>
                  {log.user && (
                    <Text style={styles.logUser}>
                      {log.user.name} · {log.user.role?.replace(/_/g, ' ')}
                    </Text>
                  )}
                  {log.details ? <Text style={styles.logDetails}>{log.details}</Text> : null}
                  <Text style={styles.logDate}>{formatDate(log.createdAt)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorText: { color: '#E74C3C', fontSize: 15, fontWeight: '600', marginTop: 12 },
  retryBtn: { marginTop: 16, backgroundColor: BRAND.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E8F0EC' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  headerSub: { fontSize: 13, color: '#666', marginTop: 2 },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C8DFD0',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#5A7A63' },
  filterChipTextActive: { color: '#FFFFFF' },
  list: { padding: 16, gap: 8, paddingBottom: 32 },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  actionDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  logBody: { flex: 1 },
  logTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  actionBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  actionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  entityLabel: { fontSize: 12, color: '#5A7A63', fontWeight: '500' },
  logUser: { fontSize: 12, color: '#1A2D1E', fontWeight: '600', marginBottom: 2 },
  logDetails: { fontSize: 11, color: '#777', marginBottom: 2, lineHeight: 16 },
  logDate: { fontSize: 11, color: '#AAA', marginTop: 2 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: '#999', fontSize: 14 },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  loadMoreText: { color: BRAND.primary, fontWeight: '600', fontSize: 14 },
  filterChipActionActive: { backgroundColor: '#1A5276', borderColor: '#1A5276' },
  dateFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateFilterBtnActive: { backgroundColor: BRAND.primary },
  dateFilterBtnText: { fontSize: 12, fontWeight: '700', color: BRAND.primary },
  activeDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
  },
  activeDateText: { fontSize: 12, color: BRAND.primaryDark, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#C8DFD0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A2D1E', marginBottom: 4 },
  modalHint: { fontSize: 12, color: '#5A7A63', marginBottom: 16 },
  modalFieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  modalInput: {
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A2D1E',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  clearBtn: { flex: 1, backgroundColor: '#F0F7F3', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  clearBtnText: { fontSize: 15, fontWeight: '700', color: '#5A7A63' },
  applyBtn: { flex: 2, backgroundColor: BRAND.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
