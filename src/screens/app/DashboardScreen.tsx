import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, Text as RNText } from 'react-native';
import { useState } from 'react';
import { ListSkeleton } from '../../components/SkeletonLoader';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

import { fetchDashboard } from '../../services/dashboardService';
import { fetchAttendanceSummary, checkIn, checkOut, getCurrentLocation } from '../../services/attendanceService';
import { DashboardMetrics, DashboardMetricCounts, RecentLead, TrendSeries } from '../../types/auth';
import { formatCurrency, statusColor, formatStatus } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { useCelebration } from '../../hooks/useCelebration';
import { getUpcomingOccasions } from '../../services/occasionsService';
import { CelebrationModal } from '../../components/CelebrationModal';
import { BRAND } from '../../theme/theme';

const SCREEN_W = Dimensions.get('window').width;

const STATUS_CHART_ITEMS = [
  { key: 'PENDING' as const,   label: 'Pending',   color: '#F39C12' },
  { key: 'APPROVED' as const,  label: 'Approved',  color: '#27AE60' },
  { key: 'DISBURSED' as const, label: 'Disbursed', color: '#3498DB' },
  { key: 'REJECTED' as const,  label: 'Rejected',  color: '#E74C3C' },
  { key: 'CANCELLED' as const, label: 'Cancelled', color: '#95A5A6' },
];

function TrendChart({ trend }: { trend: TrendSeries[] }) {
  if (!trend || trend.length === 0) return null;
  const max = Math.max(...trend.map((t) => t.value), 1);
  const BAR_H = 100;

  return (
    <View style={chartStyles.card}>
      <RNText style={chartStyles.title}>Monthly Lead Trend</RNText>
      <View style={chartStyles.barsRow}>
        {trend.map((t, i) => {
          const fillPct = max > 0 ? t.value / max : 0;
          const fillH = Math.max(fillPct * BAR_H, t.value > 0 ? 4 : 0);
          return (
            <View key={i} style={chartStyles.barCol}>
              <RNText style={chartStyles.barValue}>{t.value > 0 ? t.value : ''}</RNText>
              <View style={[chartStyles.barTrack, { height: BAR_H }]}>
                <View style={[chartStyles.barFill, { height: fillH }]} />
              </View>
              <RNText style={chartStyles.barLabel} numberOfLines={1}>
                {(t.month ?? '').slice(0, 3)}
              </RNText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatusChart({ counts }: { counts: DashboardMetricCounts }) {
  const total = STATUS_CHART_ITEMS.reduce((s, e) => s + (counts[e.key] ?? 0), 0);
  if (total === 0) return null;
  const barW = SCREEN_W - 40 - 80 - 48;

  return (
    <View style={chartStyles.card}>
      <RNText style={chartStyles.title}>Lead Status Distribution</RNText>
      {STATUS_CHART_ITEMS.map(({ key, label, color }) => {
        const val = counts[key] ?? 0;
        const pct = total > 0 ? val / total : 0;
        return (
          <View key={key} style={chartStyles.statusRow}>
            <RNText style={chartStyles.statusLabel}>{label}</RNText>
            <View style={[chartStyles.statusTrack, { width: barW }]}>
              <View
                style={[
                  chartStyles.statusFill,
                  { width: pct * barW, backgroundColor: color },
                ]}
              />
            </View>
            <RNText style={[chartStyles.statusVal, { color }]}>{val}</RNText>
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A2D1E',
    marginBottom: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    justifyContent: 'space-between',
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: 9, fontWeight: '700', color: BRAND.primary, height: 12 },
  barTrack: {
    width: '100%',
    backgroundColor: BRAND.primaryLight,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: BRAND.primary,
    borderRadius: 4,
  },
  barLabel: { fontSize: 9, color: '#5A7A63', fontWeight: '600' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  statusLabel: { fontSize: 12, color: '#5A7A63', fontWeight: '600', width: 60 },
  statusTrack: {
    height: 10,
    backgroundColor: '#F0F7F3',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statusFill: { height: '100%', borderRadius: 5 },
  statusVal: { fontSize: 12, fontWeight: '800', width: 28, textAlign: 'right' },
});

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface MetricCardProps {
  label: string;
  value?: string | number | null;
  accent: string;
  icon: string;
}

function MetricCard({ label, value, accent, icon }: MetricCardProps) {
  const hasData = value !== undefined && value !== null;
  return (
    <View style={[styles.metricCard, { borderLeftColor: accent }]}>
      <View style={[styles.metricIconWrap, { backgroundColor: accent + '18' }]}>
        <MaterialIcons name={icon as any} size={20} color={accent} />
      </View>
      <RNText style={[styles.metricValue, { color: hasData ? accent : '#C8DFD0' }]}>
        {hasData ? String(value) : '—'}
      </RNText>
      <RNText style={styles.metricLabel}>{label}</RNText>
    </View>
  );
}

interface ActionTileProps {
  label: string;
  icon: string;
  onPress: () => void;
  accent?: string;
  badge?: string;
}

function ActionTile({ label, icon, onPress, accent, badge }: ActionTileProps) {
  return (
    <TouchableOpacity style={styles.actionTile} onPress={onPress} activeOpacity={0.82}>
      <View style={[styles.actionIconWrap, accent ? { backgroundColor: accent + '18' } : null]}>
        <MaterialIcons name={icon as any} size={26} color={accent ?? BRAND.primary} />
        {badge ? (
          <View style={styles.actionBadge}>
            <RNText style={styles.actionBadgeText}>{badge}</RNText>
          </View>
        ) : null}
      </View>
      <RNText style={styles.actionLabel}>{label}</RNText>
    </TouchableOpacity>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const fullUser = useSelector((s: RootState) => s.auth.user);

  const [refreshing, setRefreshing] = useState(false);
  const [punchLoading, setPunchLoading] = useState(false);

  const dashResult = useQuery<DashboardMetrics>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  }) as any;
  const metrics: DashboardMetrics | undefined = dashResult.data;
  const isLoading: boolean = dashResult.isLoading;

  const attendResult = useQuery({
    queryKey: ['attendance', 'summary'],
    queryFn: fetchAttendanceSummary,
  }) as any;
  const attend = attendResult.data;

  const checkinMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => { (attendResult.refetch as () => void)(); },
  });
  const checkoutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: () => { (attendResult.refetch as () => void)(); },
  });

  const handlePunch = async () => {
    const isIn = attend?.todayStatus === 'CHECKED_IN';
    const isOut = attend?.todayStatus === 'CHECKED_OUT';
    if (isOut) return;
    setPunchLoading(true);
    try {
      const loc = await getCurrentLocation();
      if (isIn) { checkoutMutation.mutate(loc); } else { checkinMutation.mutate(loc); }
    } finally {
      setPunchLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      (dashResult.refetch as () => Promise<unknown>)(),
      (attendResult.refetch as () => Promise<unknown>)(),
    ]).finally(() => setRefreshing(false));
  };

  const { occasions, shouldShow, dismiss } = useCelebration();

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const todayOccasion = occasions[0] ?? null;
  const upcoming = fullUser ? getUpcomingOccasions(fullUser as any, 7) : [];

  if (isLoading && !metrics) {
    return <ListSkeleton rows={6} />;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BRAND.primary} />}
      >
        {/* Celebration Banner */}
        {todayOccasion && (
          <View style={styles.celebrationBanner}>
            <RNText style={styles.celebrationEmoji}>{todayOccasion.emoji}</RNText>
            <View style={{ flex: 1 }}>
              <RNText style={styles.celebrationTitle}>{todayOccasion.label}</RNText>
              <RNText style={styles.celebrationMsg} numberOfLines={2}>{todayOccasion.message}</RNText>
            </View>
            <MaterialIcons name="celebration" size={24} color="#F39C12" />
          </View>
        )}

        {/* Attendance Widget — first card on dashboard */}
        <TouchableOpacity
          style={styles.attendanceCard}
          onPress={() => navigation.navigate('Attendance')}
          activeOpacity={0.9}
        >
          <View style={styles.attendanceTop}>
            <View>
              <RNText style={styles.attendanceTitle}>Today's Attendance</RNText>
              <RNText style={styles.attendanceDate}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</RNText>
            </View>
            <View style={[styles.attendanceBadge, {
              backgroundColor: attend?.todayStatus === 'CHECKED_OUT' ? '#27AE60' + '22'
                : attend?.todayStatus === 'CHECKED_IN' ? BRAND.accent + '22' : '#E74C3C22',
            }]}>
              <RNText style={[styles.attendanceBadgeText, {
                color: attend?.todayStatus === 'CHECKED_OUT' ? '#27AE60'
                  : attend?.todayStatus === 'CHECKED_IN' ? BRAND.accent : '#E74C3C',
              }]}>
                {attend?.todayStatus === 'CHECKED_OUT' ? 'Done' : attend?.todayStatus === 'CHECKED_IN' ? 'Punched In' : 'Not Marked'}
              </RNText>
            </View>
          </View>

          <View style={styles.attendanceTimes}>
            <View style={styles.attendanceTimeBlock}>
              <MaterialIcons name="login" size={14} color={BRAND.primary} />
              <RNText style={styles.attendanceTimeLabel}>In</RNText>
              <RNText style={styles.attendanceTimeValue}>
                {attend?.checkInTime ? attend.checkInTime.slice(11, 16) : '—'}
              </RNText>
            </View>
            <View style={styles.attendanceTimeDivider} />
            <View style={styles.attendanceTimeBlock}>
              <MaterialIcons name="logout" size={14} color="#E74C3C" />
              <RNText style={styles.attendanceTimeLabel}>Out</RNText>
              <RNText style={styles.attendanceTimeValue}>
                {attend?.checkOutTime ? attend.checkOutTime.slice(11, 16) : '—'}
              </RNText>
            </View>
            <View style={styles.attendanceTimeDivider} />
            <View style={styles.attendanceTimeBlock}>
              <MaterialIcons name="schedule" size={14} color="#8E44AD" />
              <RNText style={styles.attendanceTimeLabel}>Hours</RNText>
              <RNText style={styles.attendanceTimeValue}>{attend?.workingHours ?? '—'}</RNText>
            </View>
            <View style={styles.attendanceTimeDivider} />
            <View style={styles.attendanceTimeBlock}>
              <MaterialIcons name="trending-up" size={14} color={BRAND.accent} />
              <RNText style={styles.attendanceTimeLabel}>Month</RNText>
              <RNText style={styles.attendanceTimeValue}>{attend?.attendancePercentage ?? 0}%</RNText>
            </View>
          </View>

          {attend?.todayStatus !== 'CHECKED_OUT' && (
            <TouchableOpacity
              style={[
                styles.attendancePunchBtn,
                attend?.todayStatus === 'CHECKED_IN' && styles.attendancePunchBtnOut,
              ]}
              onPress={(e) => { e.stopPropagation(); handlePunch(); }}
              disabled={punchLoading || attendResult.isLoading}
            >
              {punchLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <MaterialIcons
                    name={attend?.todayStatus === 'CHECKED_IN' ? 'logout' : 'fingerprint'}
                    size={18}
                    color="#FFF"
                  />
                  <RNText style={styles.attendancePunchText}>
                    {attend?.todayStatus === 'CHECKED_IN' ? 'Punch Out' : 'Punch In'}
                  </RNText>
                </>
              )}
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Welcome Banner */}
        <View style={[styles.banner, todayOccasion && styles.bannerCelebration]}>
          <RNText style={styles.greeting}>{getGreeting()}, {firstName} {todayOccasion ? todayOccasion.emoji : ''}</RNText>
          <RNText style={styles.dateText}>{formatDate()}</RNText>
        </View>

        {/* Chatbot Quick Access */}
        <TouchableOpacity
          style={styles.chatbotCard}
          onPress={() => navigation.navigate('Chatbot')}
          activeOpacity={0.85}
        >
          <View style={styles.chatbotIconWrap}>
            <MaterialIcons name="support-agent" size={28} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <RNText style={styles.chatbotTitle}>Partner Assistant</RNText>
            <RNText style={styles.chatbotSub}>Ask about channel partners, loans & docs</RNText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={BRAND.accent} />
        </TouchableOpacity>

        {/* Metrics Grid */}
        <RNText style={styles.sectionTitle}>At a glance</RNText>
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Total Leads"
            value={metrics?.totalLeads}
            accent={BRAND.primary}
            icon="people"
          />
          <MetricCard
            label="Approved"
            value={metrics?.approvedLeads}
            accent={BRAND.accent}
            icon="check-circle"
          />
          <MetricCard
            label="Disbursed"
            value={metrics?.disbursedLeads}
            accent="#F39C12"
            icon="account-balance-wallet"
          />
          <MetricCard
            label="Active Partners"
            value={metrics?.activeClinics}
            accent={BRAND.primaryDark}
            icon="local-hospital"
          />
          <MetricCard
            label="Approval Rate"
            value={metrics?.approvalRate != null ? `${metrics.approvalRate}%` : null}
            accent={BRAND.accent}
            icon="trending-up"
          />
          <MetricCard
            label="Disbursal Rate"
            value={metrics?.disbursalRate != null ? `${metrics.disbursalRate}%` : null}
            accent="#8E44AD"
            icon="show-chart"
          />
          <MetricCard
            label="Lead Value"
            value={metrics?.totalLeadValue ? formatCurrency(metrics.totalLeadValue) : null}
            accent="#E67E22"
            icon="monetization-on"
          />
          <MetricCard
            label="Pending Review"
            value={metrics?.pendingLeads}
            accent="#E74C3C"
            icon="hourglass-empty"
          />
        </View>

        {/* Charts */}
        {metrics?.trend && metrics.trend.length > 0 && (
          <>
            <RNText style={[styles.sectionTitle, { marginTop: 28 }]}>Trends &amp; distribution</RNText>
            <TrendChart trend={metrics.trend} />
            {metrics.leadStatusCounts && <StatusChart counts={metrics.leadStatusCounts} />}
          </>
        )}

        {/* Target Progress */}
        {metrics?.runRate?.target ? (
          <>
            <RNText style={[styles.sectionTitle, { marginTop: 28 }]}>Monthly target</RNText>
            <View style={styles.targetCard}>
              <View style={styles.targetRow}>
                <RNText style={styles.targetLabel}>Leads</RNText>
                <RNText style={styles.targetValue}>{metrics.runRate.achieved} / {metrics.runRate.target}</RNText>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(metrics.runRate.percentage, 100)}%` as any }]} />
              </View>
              <RNText style={styles.progressPct}>{metrics.runRate.percentage}% achieved</RNText>
            </View>
          </>
        ) : null}

        {/* Recent Activity */}
        {metrics?.recentLeads && metrics.recentLeads.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <RNText style={[styles.sectionTitle, { marginBottom: 0 }]}>Recent leads</RNText>
              <TouchableOpacity onPress={() => navigation.navigate('Leads')}>
                <RNText style={styles.viewAll}>View all</RNText>
              </TouchableOpacity>
            </View>
            <View style={styles.recentCard}>
              {metrics.recentLeads.slice(0, 5).map((lead: RecentLead, i: number) => {
                const color = statusColor(lead.status);
                return (
                  <TouchableOpacity
                    key={lead.id}
                    style={[styles.recentRow, i < Math.min(metrics.recentLeads.length, 5) - 1 && styles.recentRowBorder]}
                    onPress={() => navigation.navigate('LeadDetails', { leadId: lead.id })}
                    activeOpacity={0.75}
                  >
                    <View style={{ flex: 1 }}>
                      <RNText style={styles.recentName} numberOfLines={1}>{lead.applicantName}</RNText>
                      <RNText style={styles.recentClinic} numberOfLines={1}>{lead.clinicName || '—'}</RNText>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 3 }}>
                      <View style={[styles.recentStatusBadge, { backgroundColor: color + '18', borderColor: color }]}>
                        <RNText style={[styles.recentStatusText, { color }]}>{formatStatus(lead.status)}</RNText>
                      </View>
                      <RNText style={styles.recentAmount}>{formatCurrency(lead.amount)}</RNText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Quick Actions */}
        <RNText style={[styles.sectionTitle, { marginTop: 28 }]}>Quick actions</RNText>
        <View style={styles.actionsGrid}>
          <ActionTile label="Leads" icon="people" onPress={() => navigation.navigate('Leads')} />
          <ActionTile label="Partners" icon="business" onPress={() => navigation.navigate('ClinicOnboarding')} />
          <ActionTile label="Enquiries" icon="assignment" onPress={() => navigation.navigate('Enquiries')} />
          <ActionTile
            label="Assistant"
            icon="support-agent"
            accent="#7C3AED"
            onPress={() => navigation.navigate('Chatbot')}
          />
          <ActionTile label="Reports" icon="bar-chart" onPress={() => navigation.navigate('Reports')} />
          <ActionTile label="Profile" icon="person-outline" onPress={() => navigation.navigate('Profile')} />
        </View>

        {/* Upcoming Occasions */}
        {upcoming.length > 0 && (
          <>
            <RNText style={[styles.sectionTitle, { marginTop: 28 }]}>Coming up</RNText>
            <View style={styles.upcomingCard}>
              {upcoming.map((u, i) => (
                <View
                  key={i}
                  style={[styles.upcomingRow, i < upcoming.length - 1 && styles.upcomingRowBorder]}
                >
                  <RNText style={styles.upcomingEmoji}>{u.occasion.emoji}</RNText>
                  <RNText style={styles.upcomingLabel}>{u.occasion.label}</RNText>
                  <View style={styles.upcomingBadge}>
                    <RNText style={styles.upcomingBadgeText}>
                      {u.daysAway === 1 ? 'Tomorrow' : `In ${u.daysAway} days`}
                    </RNText>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <CelebrationModal
        visible={shouldShow}
        occasions={occasions}
        onDismiss={dismiss}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
  },
  content: {
    padding: 20,
  },
  celebrationBanner: {
    backgroundColor: '#FFF8E7',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#F39C12',
  },
  celebrationEmoji: { fontSize: 28 },
  celebrationTitle: { fontSize: 14, fontWeight: '700', color: '#7A5500', marginBottom: 3 },
  celebrationMsg: { fontSize: 12, color: '#7A5500', lineHeight: 17 },
  banner: {
    backgroundColor: BRAND.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bannerCelebration: {
    backgroundColor: BRAND.primaryDark,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dateText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  chatbotCard: {
    backgroundColor: BRAND.primaryDark,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    elevation: 3,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  chatbotIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatbotTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  chatbotSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2D1E',
    marginBottom: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#5A7A63',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionTile: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    minWidth: 16,
    paddingHorizontal: 3,
    paddingVertical: 1,
    alignItems: 'center',
  },
  actionBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A2D1E',
    textAlign: 'center',
    lineHeight: 15,
  },
  upcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  upcomingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
  },
  upcomingEmoji: { fontSize: 20 },
  upcomingLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1A2D1E' },
  upcomingBadge: {
    backgroundColor: BRAND.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  upcomingBadgeText: { fontSize: 11, fontWeight: '700', color: BRAND.primary },
  targetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  targetLabel: { fontSize: 13, fontWeight: '600', color: '#1A2D1E' },
  targetValue: { fontSize: 13, fontWeight: '700', color: BRAND.primary },
  progressBar: {
    height: 8,
    backgroundColor: BRAND.primaryLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: BRAND.accent,
    borderRadius: 4,
  },
  progressPct: { fontSize: 11, color: '#5A7A63', fontWeight: '600', textAlign: 'right' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 14,
  },
  viewAll: { fontSize: 13, fontWeight: '600', color: BRAND.primary },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  recentRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F7F3' },
  recentName: { fontSize: 13, fontWeight: '700', color: '#1A2D1E' },
  recentClinic: { fontSize: 11, color: '#5A7A63', marginTop: 2 },
  recentStatusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  recentStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  recentAmount: { fontSize: 11, color: '#5A7A63', fontWeight: '600' },
  attendanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: BRAND.primary,
    elevation: 3,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  attendanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  attendanceTitle: { fontSize: 14, fontWeight: '700', color: '#1A2D1E' },
  attendanceDate: { fontSize: 11, color: '#5A7A63', marginTop: 2 },
  attendanceBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  attendanceBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  attendanceTimes: {
    flexDirection: 'row',
    backgroundColor: '#F9FDFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  attendanceTimeBlock: { flex: 1, alignItems: 'center', gap: 2 },
  attendanceTimeDivider: { width: 1, backgroundColor: '#E8F0EC' },
  attendanceTimeLabel: { fontSize: 9, color: '#5A7A63', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  attendanceTimeValue: { fontSize: 14, fontWeight: '800', color: '#1A2D1E' },
  attendancePunchBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  attendancePunchBtnOut: { backgroundColor: '#E74C3C' },
  attendancePunchText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
