import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { BRAND } from '../../theme/theme';
import { AuditLog } from '../../types/auth';
import { fetchAuditLogs } from '../../services/auditLogService';
import { formatDate } from '../../utils/format';

const ENTITY_FILTERS = ['All', 'Lead', 'Clinic', 'User', 'Target'];

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

export function AuditLogsScreen() {
  const [entityFilter, setEntityFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const queryResult = useQuery({
    queryKey: ['audit-logs', entityFilter, page],
    queryFn: () =>
      fetchAuditLogs({
        page,
        entity: entityFilter !== 'All' ? entityFilter.toUpperCase() : undefined,
      }),
  }) as any;

  const data = queryResult.data as { logs: AuditLog[]; total: number; page: number } | undefined;
  const logs: AuditLog[] = data?.logs ?? [];
  const total: number = data?.total ?? 0;
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)().finally(() => setRefreshing(false));

  const hasMore = logs.length < total;

  const handleFilterChange = (f: string) => {
    setEntityFilter(f);
    setPage(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <Text style={styles.headerSub}>{total} event{total !== 1 ? 's' : ''}</Text>
      </View>

      {/* Entity filter chips */}
      <View style={styles.filterBar}>
        {ENTITY_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, entityFilter === f && styles.filterChipActive]}
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[styles.filterChipText, entityFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E8F0EC' },
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
});
