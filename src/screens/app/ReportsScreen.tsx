import React, { useState } from 'react';
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
import { downloadAndShareExport, ExportType } from '../../utils/nativeExport';
import { fetchDashboard } from '../../services/dashboardService';
import {
  fetchMonthlyReport,
  fetchRegionReport,
  fetchRMReport,
  fetchLenderReport,
} from '../../services/reportsService';
import {
  DashboardMetrics,
  MonthlyReport,
  RegionReport,
  RMReport,
  LenderReport,
} from '../../types/auth';
import { formatCurrency } from '../../utils/format';

type TabKey = 'summary' | 'monthly' | 'region' | 'rm' | 'lender';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'region', label: 'Region' },
  { key: 'rm', label: 'RM' },
  { key: 'lender', label: 'Lender' },
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <RNText style={styles.cardTitle}>{title}</RNText>
      {children}
    </View>
  );
}

function MetricRow({ icon, label, value, color }: { icon: string; label: string; value: string | number | null | undefined; color: string }) {
  const hasData = value !== undefined && value !== null && value !== '';
  return (
    <View style={styles.metricRow}>
      <View style={[styles.metricIcon, { backgroundColor: color + '18' }]}>
        <MaterialIcons name={icon as any} size={18} color={color} />
      </View>
      <RNText style={styles.metricLabel}>{label}</RNText>
      <RNText style={[styles.metricValue, { color: hasData ? color : '#C8DFD0' }]}>
        {hasData ? String(value) : '—'}
      </RNText>
    </View>
  );
}

function PipelineBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
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

function TrendBar({ month, value, maxValue }: { month: string; value: number; maxValue: number }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View style={styles.trendItem}>
      <View style={styles.trendBarWrap}>
        <View style={[styles.trendBarFill, { height: `${Math.max(pct, 4)}%`, backgroundColor: BRAND.primary }]} />
      </View>
      <RNText style={styles.trendCount}>{value}</RNText>
      <RNText style={styles.trendMonth}>{month.slice(0, 3)}</RNText>
    </View>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <View style={styles.tableRow}>
      {cols.map((c, i) => (
        <RNText key={i} style={[styles.tableHeader, i > 0 && styles.tableNumCell]}>{c}</RNText>
      ))}
    </View>
  );
}

function TableRow({ cells, highlight }: { cells: (string | number)[]; highlight?: boolean }) {
  return (
    <View style={[styles.tableRow, styles.tableDataRow, highlight && styles.tableRowHighlight]}>
      {cells.map((c, i) => (
        <RNText key={i} style={[styles.tableCell, i > 0 && styles.tableNumCell]}>{String(c)}</RNText>
      ))}
    </View>
  );
}

function LoadingBox() {
  return (
    <View style={styles.loadingBox}>
      <ActivityIndicator color={BRAND.primary} size="small" />
      <RNText style={styles.loadingText}>Loading...</RNText>
    </View>
  );
}

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorBox}>
      <MaterialIcons name="cloud-off" size={32} color="#C8DFD0" />
      <RNText style={styles.errorText}>Could not load report</RNText>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <RNText style={styles.retryText}>Retry</RNText>
      </TouchableOpacity>
    </View>
  );
}

function SummaryTab({ data }: { data: DashboardMetrics | undefined }) {
  const totalLeads = data?.totalLeads ?? 0;
  const counts = data?.leadStatusCounts;
  const runRate = data?.runRate;
  const trend = data?.trend ?? [];
  const maxTrendValue = trend.length > 0 ? Math.max(...trend.map((t) => t.value), 1) : 1;

  return (
    <>
      <SectionCard title="Lead Overview">
        <MetricRow icon="people" label="Total Leads" value={totalLeads} color={BRAND.primary} />
        <MetricRow icon="check-circle" label="Approved" value={data?.approvedLeads} color="#27AE60" />
        <MetricRow icon="account-balance-wallet" label="Disbursed" value={data?.disbursedLeads} color="#3498DB" />
        <MetricRow icon="pending" label="Pending" value={data?.pendingLeads} color="#F39C12" />
        <MetricRow icon="local-hospital" label="Active Partners" value={data?.activeClinics} color={BRAND.primaryDark} />
      </SectionCard>
      <SectionCard title="Value Metrics">
        <MetricRow icon="trending-up" label="Approved Value" value={formatCurrency(data?.approvedValue)} color="#27AE60" />
        <MetricRow icon="payments" label="Disbursed Value" value={formatCurrency(data?.disbursedValue)} color="#3498DB" />
      </SectionCard>
      {counts && totalLeads > 0 && (
        <SectionCard title="Pipeline Breakdown">
          <PipelineBar label="Approved" count={counts.APPROVED} total={totalLeads} color="#27AE60" />
          <PipelineBar label="Disbursed" count={counts.DISBURSED} total={totalLeads} color="#3498DB" />
          <PipelineBar label="Pending" count={counts.PENDING} total={totalLeads} color="#F39C12" />
          <PipelineBar label="Rejected" count={counts.REJECTED} total={totalLeads} color="#E74C3C" />
          <PipelineBar label="Cancelled" count={counts.CANCELLED} total={totalLeads} color="#95A5A6" />
        </SectionCard>
      )}
      {runRate && (
        <SectionCard title="Monthly Run Rate">
          <View style={styles.runRateContainer}>
            <View style={styles.runRateBlock}>
              <RNText style={styles.runRateLabel}>Target</RNText>
              <RNText style={styles.runRateValue}>{runRate.target || '—'}</RNText>
            </View>
            <View style={styles.runRateDivider} />
            <View style={styles.runRateBlock}>
              <RNText style={styles.runRateLabel}>Achieved</RNText>
              <RNText style={[styles.runRateValue, { color: BRAND.accent }]}>{runRate.achieved || '—'}</RNText>
            </View>
            <View style={styles.runRateDivider} />
            <View style={styles.runRateBlock}>
              <RNText style={styles.runRateLabel}>Achievement</RNText>
              <RNText style={[styles.runRateValue, { color: runRate.percentage >= 100 ? '#27AE60' : '#F39C12' }]}>
                {runRate.percentage}%
              </RNText>
            </View>
          </View>
          <View style={styles.runRateBarBg}>
            <View style={[styles.runRateBarFill, { width: `${Math.min(runRate.percentage, 100)}%` }, runRate.percentage >= 100 && { backgroundColor: '#27AE60' }]} />
          </View>
        </SectionCard>
      )}
      {trend.length > 0 && (
        <SectionCard title="Monthly Trend">
          <View style={styles.trendChart}>
            {trend.map((t) => <TrendBar key={t.month} month={t.month} value={t.value} maxValue={maxTrendValue} />)}
          </View>
        </SectionCard>
      )}
      <ExportButton exportType="dashboard" label="Dashboard" />
    </>
  );
}

function MonthlyTab() {
  const qr = useQuery<MonthlyReport[]>({ queryKey: ['reports-monthly'], queryFn: () => fetchMonthlyReport(6) }) as any;
  const data: MonthlyReport[] = qr.data ?? [];
  if (qr.isLoading) return <LoadingBox />;
  if (qr.isError) return <ErrorBox onRetry={() => (qr.refetch as () => void)()} />;
  if (data.length === 0) return <EmptyBox icon="date-range" message="No monthly data" />;
  return (
    <>
      <SectionCard title="Monthly Breakdown (6 months)">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <TableHeader cols={['Period', 'Leads', 'Apprvd', 'Disb', 'App%', 'Disb%', 'Lead Value', 'Apprvd Value', 'Disb Value']} />
            {data.map((r, i) => (
              <TableRow
                key={r.period}
                highlight={i % 2 === 0}
                cells={[
                  r.month || r.period,
                  r.totalLeads,
                  r.approved,
                  r.disbursed,
                  `${r.approvalRate}%`,
                  `${r.disbursalRate ?? 0}%`,
                  formatCurrency(r.leadValue),
                  formatCurrency(r.approvedValue),
                  formatCurrency(r.disbursedValue),
                ]}
              />
            ))}
          </View>
        </ScrollView>
      </SectionCard>
      <ExportButton exportType="leads" label="Leads" />
    </>
  );
}

function RegionTab() {
  const qr = useQuery<RegionReport[]>({ queryKey: ['reports-region'], queryFn: fetchRegionReport }) as any;
  const data: RegionReport[] = qr.data ?? [];
  if (qr.isLoading) return <LoadingBox />;
  if (qr.isError) return <ErrorBox onRetry={() => (qr.refetch as () => void)()} />;
  if (data.length === 0) return <EmptyBox icon="map" message="No region data" />;
  return (
    <>
      <SectionCard title="Region-wise Performance">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <TableHeader cols={['Region', 'Leads', 'Apprvd', 'Disb', 'Rate', 'Lead Value', 'Disb Value']} />
            {data.map((r, i) => (
              <TableRow
                key={r.id}
                highlight={i % 2 === 0}
                cells={[r.name, r.totalLeads, r.approved, r.disbursed, `${r.approvalRate}%`, formatCurrency(r.leadValue), formatCurrency(r.disbursedValue)]}
              />
            ))}
          </View>
        </ScrollView>
      </SectionCard>
      <ExportButton exportType="clinics" label="Clinics" />
    </>
  );
}

function RMTab() {
  const qr = useQuery<RMReport[]>({ queryKey: ['reports-rm'], queryFn: fetchRMReport }) as any;
  const data: RMReport[] = qr.data ?? [];
  if (qr.isLoading) return <LoadingBox />;
  if (qr.isError) return <ErrorBox onRetry={() => (qr.refetch as () => void)()} />;
  if (data.length === 0) return <EmptyBox icon="person" message="No RM data" />;
  return (
    <SectionCard title="RM-wise Performance">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <TableHeader cols={['Name', 'Role', 'Leads', 'Apprvd', 'Disb', 'Rate', 'Lead Value', 'Disb Value']} />
          {data.map((r, i) => (
            <TableRow
              key={r.id}
              highlight={i % 2 === 0}
              cells={[r.name, r.role?.replace(/_/g, ' ') ?? '—', r.totalLeads, r.approved, r.disbursed, `${r.approvalRate}%`, formatCurrency(r.leadValue), formatCurrency(r.disbursedValue)]}
            />
          ))}
        </View>
      </ScrollView>
    </SectionCard>
  );
}

function LenderApprovalChart({ data }: { data: LenderReport[] }) {
  if (data.length === 0) return null;
  const maxLeads = Math.max(...data.map((r) => r.totalLeads), 1);
  return (
    <SectionCard title="Lender Approval Chart">
      {data.slice(0, 8).map((r) => {
        const leadPct = (r.totalLeads / maxLeads) * 100;
        const apprvdPct = r.totalLeads > 0 ? (r.approved / r.totalLeads) * 100 : 0;
        return (
          <View key={r.id} style={styles.lenderChartRow}>
            <RNText style={styles.lenderChartName} numberOfLines={1}>{r.name}</RNText>
            <View style={styles.lenderChartBars}>
              <View style={styles.lenderBarTrack}>
                <View style={[styles.lenderBarFill, { width: `${leadPct}%`, backgroundColor: BRAND.primary + '40' }]} />
                <View style={[styles.lenderBarFillOverlay, { width: `${apprvdPct}%`, backgroundColor: BRAND.accent }]} />
              </View>
              <RNText style={styles.lenderChartRate}>{r.approvalRate}%</RNText>
            </View>
          </View>
        );
      })}
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BRAND.primary + '40' }]} />
          <RNText style={styles.legendLabel}>Total Leads</RNText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BRAND.accent }]} />
          <RNText style={styles.legendLabel}>Approved</RNText>
        </View>
      </View>
    </SectionCard>
  );
}

function LenderTab() {
  const qr = useQuery<LenderReport[]>({ queryKey: ['reports-lender'], queryFn: fetchLenderReport }) as any;
  const data: LenderReport[] = qr.data ?? [];
  if (qr.isLoading) return <LoadingBox />;
  if (qr.isError) return <ErrorBox onRetry={() => (qr.refetch as () => void)()} />;
  if (data.length === 0) return <EmptyBox icon="account-balance" message="No lender data" />;
  return (
    <>
      <LenderApprovalChart data={data} />
      <SectionCard title="Lender-wise Performance">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <TableHeader cols={['Lender', 'Code', 'Leads', 'Apprvd', 'Disb', 'App%', 'Disb%', 'Apprvd Value', 'Disb Value']} />
            {data.map((r, i) => (
              <TableRow
                key={r.id}
                highlight={i % 2 === 0}
                cells={[r.name, r.code, r.totalLeads, r.approved, r.disbursed, `${r.approvalRate}%`, `${r.disbursalRate ?? 0}%`, formatCurrency(r.approvedValue), formatCurrency(r.disbursedValue)]}
              />
            ))}
          </View>
        </ScrollView>
      </SectionCard>
      <ExportButton exportType="lender" label="Lender" />
    </>
  );
}

function ExportButton({ exportType, label }: { exportType: ExportType; label: string }) {
  const handleExport = () => downloadAndShareExport(exportType);
  return (
    <TouchableOpacity style={styles.exportBtn} onPress={handleExport} activeOpacity={0.75}>
      <MaterialIcons name="download" size={15} color={BRAND.primary} />
      <RNText style={styles.exportBtnText}>Export {label} (.xlsx)</RNText>
    </TouchableOpacity>
  );
}

function EmptyBox({ icon, message }: { icon: string; message: string }) {
  return (
    <View style={styles.errorBox}>
      <MaterialIcons name={icon as any} size={36} color="#C8DFD0" />
      <RNText style={styles.emptyMsg}>{message}</RNText>
      <RNText style={styles.emptyHint}>Data will populate as leads are processed.</RNText>
    </View>
  );
}

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('summary');

  const dashResult = useQuery<DashboardMetrics>({ queryKey: ['dashboard'], queryFn: fetchDashboard }) as any;
  const dashData: DashboardMetrics | undefined = dashResult.data;
  const dashLoading: boolean = dashResult.isLoading;

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.background }}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <RNText style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </RNText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'summary' && (
          dashLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={BRAND.primary} size="large" />
              <RNText style={styles.loadingText}>Loading reports...</RNText>
            </View>
          ) : dashResult.isError ? (
            <ErrorBox onRetry={() => (dashResult.refetch as () => void)()} />
          ) : (
            <SummaryTab data={dashData} />
          )
        )}
        {activeTab === 'monthly' && <MonthlyTab />}
        {activeTab === 'region' && <RegionTab />}
        {activeTab === 'rm' && <RMTab />}
        {activeTab === 'lender' && <LenderTab />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 16, gap: 16 },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
  },
  tabScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C8DFD0',
    backgroundColor: '#FFFFFF',
  },
  tabItemActive: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#5A7A63' },
  tabLabelActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 14,
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
  metricLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1A2D1E' },
  metricValue: { fontSize: 16, fontWeight: '800' },
  pipelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  pipelineLabel: { width: 72, fontSize: 12, fontWeight: '600', color: '#5A7A63' },
  pipelineBarBg: { flex: 1, height: 8, backgroundColor: '#F0F7F3', borderRadius: 4, overflow: 'hidden' },
  pipelineBarFill: { height: 8, borderRadius: 4 },
  pipelineCount: { width: 32, textAlign: 'right', fontSize: 13, fontWeight: '800' },
  runRateContainer: { flexDirection: 'row', marginBottom: 14 },
  runRateBlock: { flex: 1, alignItems: 'center' },
  runRateDivider: { width: 1, backgroundColor: '#F0F7F3' },
  runRateLabel: { fontSize: 11, color: '#5A7A63', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  runRateValue: { fontSize: 18, fontWeight: '800', color: '#1A2D1E' },
  runRateBarBg: { height: 10, backgroundColor: '#F0F7F3', borderRadius: 5, overflow: 'hidden' },
  runRateBarFill: { height: 10, borderRadius: 5, backgroundColor: BRAND.primary },
  trendChart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 },
  trendItem: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  trendBarWrap: { width: '100%', height: 70, justifyContent: 'flex-end', backgroundColor: '#F0F7F3', borderRadius: 6, overflow: 'hidden' },
  trendBarFill: { width: '100%', borderRadius: 6 },
  trendCount: { fontSize: 10, fontWeight: '700', color: '#1A2D1E', marginTop: 4 },
  trendMonth: { fontSize: 9, color: '#5A7A63', fontWeight: '500' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F0F7F3', minWidth: 300 },
  tableDataRow: {},
  tableRowHighlight: { backgroundColor: '#F9FDFB' },
  tableHeader: { flex: 1.5, fontSize: 11, fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: 0.3 },
  tableCell: { flex: 1.5, fontSize: 13, color: '#1A2D1E', fontWeight: '500' },
  tableNumCell: { flex: 1, textAlign: 'right', fontWeight: '600' },
  loadingBox: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  loadingText: { color: '#5A7A63', fontSize: 14 },
  errorBox: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  errorText: { color: '#E74C3C', fontSize: 14, fontWeight: '600' },
  emptyMsg: { fontSize: 14, fontWeight: '600', color: '#1A2D1E' },
  emptyHint: { fontSize: 12, color: '#5A7A63', textAlign: 'center' },
  retryBtn: { marginTop: 8, backgroundColor: BRAND.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    backgroundColor: '#FFFFFF',
  },
  exportBtnText: { fontSize: 12, fontWeight: '700', color: BRAND.primary },
  lenderChartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  lenderChartName: { width: 80, fontSize: 11, fontWeight: '600', color: '#1A2D1E' },
  lenderChartBars: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  lenderBarTrack: { flex: 1, height: 16, backgroundColor: '#F0F7F3', borderRadius: 8, overflow: 'hidden', position: 'relative' },
  lenderBarFill: { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 8 },
  lenderBarFillOverlay: { position: 'absolute', top: 2, left: 0, bottom: 2, borderRadius: 6 },
  lenderChartRate: { width: 36, fontSize: 12, fontWeight: '700', color: BRAND.accent, textAlign: 'right' },
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F7F3' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, color: '#5A7A63', fontWeight: '500' },
});
