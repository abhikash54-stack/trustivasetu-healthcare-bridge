import {
  ScrollView,
  StyleSheet,
  View,
  Text as RNText,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import { fetchDashboard } from '../../services/dashboardService';
import { DashboardMetrics } from '../../types/auth';
import { formatCurrency } from '../../utils/format';

function MetricRow({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number | null | undefined;
  color: string;
}) {
  const hasData = value !== undefined && value !== null && value !== '';
  return (
    <View style={styles.metricRow}>
      <View style={[styles.metricIcon, { backgroundColor: color + '18' }]}>
        <MaterialIcons name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.metricInfo}>
        <RNText style={styles.metricLabel}>{label}</RNText>
      </View>
      <RNText style={[styles.metricValue, { color: hasData ? color : '#C8DFD0' }]}>
        {hasData ? String(value) : '—'}
      </RNText>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <RNText style={styles.cardTitle}>{title}</RNText>
      {children}
    </View>
  );
}

function PipelineBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.pipelineRow}>
      <RNText style={styles.pipelineLabel}>{label}</RNText>
      <View style={styles.pipelineBarBg}>
        <View style={[styles.pipelineBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
      </View>
      <RNText style={[styles.pipelineCount, { color }]}>{count}</RNText>
    </View>
  );
}

function TrendBar({
  month,
  value,
  maxValue,
}: {
  month: string;
  value: number;
  maxValue: number;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View style={styles.trendItem}>
      <View style={styles.trendBarWrap}>
        <View
          style={[
            styles.trendBarFill,
            { height: `${Math.max(pct, 4)}%`, backgroundColor: BRAND.primary },
          ]}
        />
      </View>
      <RNText style={styles.trendCount}>{value}</RNText>
      <RNText style={styles.trendMonth}>{month.slice(0, 3)}</RNText>
    </View>
  );
}

export function ReportsScreen() {
  const insets = useSafeAreaInsets();

  const queryResult = useQuery<DashboardMetrics>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  }) as any;

  const data: DashboardMetrics | undefined = queryResult.data;
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND.primary} size="large" />
        <RNText style={styles.loadingText}>Loading reports...</RNText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
        <RNText style={styles.errorText}>Could not load reports</RNText>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <RNText style={styles.retryText}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const totalLeads = data?.totalLeads ?? 0;
  const counts = data?.leadStatusCounts;
  const runRate = data?.runRate;
  const trend = data?.trend ?? [];
  const maxTrendValue = trend.length > 0 ? Math.max(...trend.map((t) => t.value), 1) : 1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary */}
      <SectionCard title="Lead Overview">
        <MetricRow icon="people" label="Total Leads" value={totalLeads} color={BRAND.primary} />
        <MetricRow icon="check-circle" label="Approved" value={data?.approvedLeads} color="#27AE60" />
        <MetricRow icon="account-balance-wallet" label="Disbursed" value={data?.disbursedLeads} color="#3498DB" />
        <MetricRow icon="pending" label="Pending" value={data?.pendingLeads} color="#F39C12" />
        <MetricRow icon="local-hospital" label="Active Partners" value={data?.activeClinics} color={BRAND.primaryDark} />
        {data?.topClinic ? (
          <MetricRow icon="star" label="Top Partner" value={data.topClinic} color={BRAND.accent} />
        ) : null}
      </SectionCard>

      {/* Value metrics */}
      <SectionCard title="Value Metrics">
        <MetricRow
          icon="trending-up"
          label="Approved Value"
          value={formatCurrency(data?.approvedValue)}
          color="#27AE60"
        />
        <MetricRow
          icon="payments"
          label="Disbursed Value"
          value={formatCurrency(data?.disbursedValue)}
          color="#3498DB"
        />
      </SectionCard>

      {/* Pipeline breakdown */}
      {counts && totalLeads > 0 ? (
        <SectionCard title="Pipeline Breakdown">
          <PipelineBar label="Approved" count={counts.APPROVED} total={totalLeads} color="#27AE60" />
          <PipelineBar label="Disbursed" count={counts.DISBURSED} total={totalLeads} color="#3498DB" />
          <PipelineBar label="Pending" count={counts.PENDING} total={totalLeads} color="#F39C12" />
          <PipelineBar label="Rejected" count={counts.REJECTED} total={totalLeads} color="#E74C3C" />
          <PipelineBar label="Cancelled" count={counts.CANCELLED} total={totalLeads} color="#95A5A6" />
        </SectionCard>
      ) : null}

      {/* Run Rate */}
      {runRate ? (
        <SectionCard title="Monthly Run Rate">
          <View style={styles.runRateContainer}>
            <View style={styles.runRateBlock}>
              <RNText style={styles.runRateLabel}>Target</RNText>
              <RNText style={styles.runRateValue}>{runRate.target}</RNText>
            </View>
            <View style={styles.runRateDivider} />
            <View style={styles.runRateBlock}>
              <RNText style={styles.runRateLabel}>Achieved</RNText>
              <RNText style={[styles.runRateValue, { color: BRAND.accent }]}>{runRate.achieved}</RNText>
            </View>
            <View style={styles.runRateDivider} />
            <View style={styles.runRateBlock}>
              <RNText style={styles.runRateLabel}>Achievement</RNText>
              <RNText
                style={[
                  styles.runRateValue,
                  { color: runRate.percentage >= 100 ? '#27AE60' : '#F39C12' },
                ]}
              >
                {runRate.percentage}%
              </RNText>
            </View>
          </View>
          <View style={styles.runRateBarBg}>
            <View
              style={[
                styles.runRateBarFill,
                { width: `${Math.min(runRate.percentage, 100)}%` },
                runRate.percentage >= 100 && { backgroundColor: '#27AE60' },
              ]}
            />
          </View>
        </SectionCard>
      ) : null}

      {/* Monthly trend */}
      {trend.length > 0 ? (
        <SectionCard title="Monthly Trend">
          <View style={styles.trendChart}>
            {trend.map((t) => (
              <TrendBar key={t.month} month={t.month} value={t.value} maxValue={maxTrendValue} />
            ))}
          </View>
        </SectionCard>
      ) : null}

      {!data && (
        <View style={styles.noDataCard}>
          <MaterialIcons name="bar-chart" size={40} color="#C8DFD0" />
          <RNText style={styles.noDataText}>No report data available yet</RNText>
          <RNText style={styles.noDataHint}>Data will populate as leads and partners are added.</RNText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20, gap: 16 },
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
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
    gap: 12,
  },
  metricIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  metricInfo: { flex: 1 },
  metricLabel: { fontSize: 13, fontWeight: '600', color: '#1A2D1E' },
  metricValue: { fontSize: 16, fontWeight: '800' },
  pipelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  pipelineLabel: { width: 72, fontSize: 12, fontWeight: '600', color: '#5A7A63' },
  pipelineBarBg: { flex: 1, height: 8, backgroundColor: '#F0F7F3', borderRadius: 4, overflow: 'hidden' },
  pipelineBarFill: { height: 8, borderRadius: 4 },
  pipelineCount: { width: 32, textAlign: 'right', fontSize: 13, fontWeight: '800' },
  runRateContainer: { flexDirection: 'row', marginBottom: 14 },
  runRateBlock: { flex: 1, alignItems: 'center' },
  runRateDivider: { width: 1, backgroundColor: '#F0F7F3' },
  runRateLabel: {
    fontSize: 11,
    color: '#5A7A63',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  runRateValue: { fontSize: 18, fontWeight: '800', color: '#1A2D1E' },
  runRateBarBg: { height: 10, backgroundColor: '#F0F7F3', borderRadius: 5, overflow: 'hidden' },
  runRateBarFill: { height: 10, borderRadius: 5, backgroundColor: BRAND.primary },
  trendChart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 },
  trendItem: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  trendBarWrap: {
    width: '100%',
    height: 70,
    justifyContent: 'flex-end',
    backgroundColor: '#F0F7F3',
    borderRadius: 6,
    overflow: 'hidden',
  },
  trendBarFill: { width: '100%', borderRadius: 6 },
  trendCount: { fontSize: 10, fontWeight: '700', color: '#1A2D1E', marginTop: 4 },
  trendMonth: { fontSize: 9, color: '#5A7A63', fontWeight: '500' },
  noDataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  noDataText: { fontSize: 15, fontWeight: '700', color: '#1A2D1E' },
  noDataHint: { fontSize: 13, color: '#5A7A63', textAlign: 'center', lineHeight: 20 },
});
