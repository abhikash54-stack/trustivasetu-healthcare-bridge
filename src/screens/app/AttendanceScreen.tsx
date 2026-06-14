import React, { useState, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import {
  fetchAttendanceSummary,
  fetchAttendanceHistory,
  checkIn,
  checkOut,
  getCurrentLocation,
  GpsLocation,
} from '../../services/attendanceService';
import { AttendanceRecord } from '../../types/auth';

const STATUS_COLOR: Record<string, string> = {
  PRESENT: '#27AE60',
  LATE: '#F39C12',
  HALF_DAY: '#E67E22',
  ABSENT: '#E74C3C',
  HOLIDAY: '#3498DB',
  WEEKEND: '#95A5A6',
};

const STATUS_LABEL: Record<string, string> = {
  PRESENT: 'Present',
  LATE: 'Late',
  HALF_DAY: 'Half Day',
  ABSENT: 'Absent',
  HOLIDAY: 'Holiday',
  WEEKEND: 'Weekend',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({ value, label, color, icon }: { value: number | string; label: string; color: string; icon: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <MaterialIcons name={icon as any} size={18} color={color} style={{ marginBottom: 4 }} />
      <RNText style={[styles.statValue, { color }]}>{value}</RNText>
      <RNText style={styles.statLabel}>{label}</RNText>
    </View>
  );
}

function AttendanceRow({ item }: { item: AttendanceRecord }) {
  const color = STATUS_COLOR[item.status] ?? '#95A5A6';
  const label = STATUS_LABEL[item.status] ?? item.status;
  const dateObj = new Date(item.date);
  const dayStr = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <View style={styles.historyRow}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <View style={styles.historyInfo}>
        <RNText style={styles.historyDate}>{dayStr}</RNText>
        {item.checkIn ? (
          <RNText style={styles.historyTimes}>
            In: {item.checkIn.slice(11, 16)}
            {item.checkOut ? `  ·  Out: ${item.checkOut.slice(11, 16)}` : ''}
            {item.workingHours ? `  ·  ${item.workingHours}` : ''}
          </RNText>
        ) : null}
      </View>
      <View style={[styles.statusChip, { backgroundColor: color + '18' }]}>
        <RNText style={[styles.statusChipText, { color }]}>{label}</RNText>
      </View>
    </View>
  );
}

function MiniCalendar({ history }: { history: AttendanceRecord[] }) {
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const statusMap: Record<string, string> = {};
  for (const r of history) {
    const key = r.date.slice(0, 10);
    statusMap[key] = r.status;
  }

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  return (
    <View style={styles.calCard}>
      <View style={styles.calHeader}>
        <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="chevron-left" size={24} color={BRAND.primary} />
        </TouchableOpacity>
        <RNText style={styles.calTitle}>{MONTHS[calMonth]} {calYear}</RNText>
        <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="chevron-right" size={24} color={BRAND.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.calDayHeader}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <RNText key={d} style={styles.calDayName}>{d}</RNText>
        ))}
      </View>
      <View style={styles.calGrid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={`empty-${idx}`} style={styles.calCell} />;
          const mm = String(calMonth + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const key = `${calYear}-${mm}-${dd}`;
          const status = statusMap[key];
          const isToday = key === todayStr;
          const dotColor = status ? (STATUS_COLOR[status] ?? '#C8DFD0') : undefined;
          return (
            <View key={key} style={[styles.calCell, isToday && styles.calCellToday]}>
              <RNText style={[styles.calDayNum, isToday && styles.calDayNumToday]}>{day}</RNText>
              {dotColor ? <View style={[styles.calDot, { backgroundColor: dotColor }]} /> : null}
            </View>
          );
        })}
      </View>
      <View style={styles.calLegend}>
        {[
          { label: 'Present', color: STATUS_COLOR.PRESENT },
          { label: 'Late', color: STATUS_COLOR.LATE },
          { label: 'Absent', color: STATUS_COLOR.ABSENT },
          { label: 'Holiday', color: STATUS_COLOR.HOLIDAY },
          { label: 'Weekend', color: STATUS_COLOR.WEEKEND },
        ].map(({ label, color }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <RNText style={styles.legendLabel}>{label}</RNText>
          </View>
        ))}
      </View>
    </View>
  );
}

type ActiveTab = 'today' | 'calendar' | 'history';

export function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [refreshing, setRefreshing] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'got' | 'denied'>('idle');
  const [capturedLocation, setCapturedLocation] = useState<GpsLocation | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const summaryResult = useQuery({
    queryKey: ['attendance', 'summary'],
    queryFn: fetchAttendanceSummary,
  }) as any;
  const summary = summaryResult.data;
  const summaryLoading: boolean = summaryResult.isLoading;

  const historyResult = useQuery({
    queryKey: ['attendance', 'history', dateFrom, dateTo],
    queryFn: () => fetchAttendanceHistory({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
  }) as any;
  const history: AttendanceRecord[] = historyResult.data ?? [];
  const historyLoading: boolean = historyResult.isLoading;

  const refetchAll = useCallback(() => {
    return Promise.all([
      (summaryResult.refetch as () => Promise<any>)(),
      (historyResult.refetch as () => Promise<any>)(),
    ]).finally(() => setRefreshing(false));
  }, [summaryResult, historyResult]);

  const acquireLocation = async (): Promise<GpsLocation | null> => {
    setGpsStatus('fetching');
    const loc = await getCurrentLocation();
    if (loc) {
      setCapturedLocation(loc);
      setGpsStatus('got');
    } else {
      setGpsStatus('denied');
    }
    return loc;
  };

  const checkinMutation = useMutation({
    mutationFn: (loc: GpsLocation | null) => checkIn(loc),
    onSuccess: (data: { checkInTime: string }) => {
      Alert.alert('Punched In', `Checked in at ${data.checkInTime.slice(11, 16)}`);
      setGpsStatus('idle');
      setCapturedLocation(null);
      refetchAll();
    },
    onError: () => Alert.alert('Error', 'Could not punch in. Please try again.'),
  });

  const checkoutMutation = useMutation({
    mutationFn: (loc: GpsLocation | null) => checkOut(loc),
    onSuccess: (data: { checkOutTime: string; workingHours: string }) => {
      Alert.alert('Punched Out', `Checked out at ${data.checkOutTime.slice(11, 16)}\nWorking hours: ${data.workingHours}`);
      setGpsStatus('idle');
      setCapturedLocation(null);
      refetchAll();
    },
    onError: () => Alert.alert('Error', 'Could not punch out. Please try again.'),
  });

  const isCheckedIn = summary?.todayStatus === 'CHECKED_IN';
  const isCheckedOut = summary?.todayStatus === 'CHECKED_OUT';
  const actionLoading = (checkinMutation as any).isPending || (checkoutMutation as any).isPending || gpsStatus === 'fetching';

  const handlePunchIn = async () => {
    Alert.alert('Punch In', 'Capture GPS location for attendance?', [
      { text: 'Skip GPS', onPress: () => checkinMutation.mutate(null) },
      {
        text: 'Use GPS',
        style: 'default',
        onPress: async () => {
          const loc = await acquireLocation();
          checkinMutation.mutate(loc);
        },
      },
    ]);
  };

  const handlePunchOut = async () => {
    Alert.alert('Punch Out', 'Capture GPS location for attendance?', [
      { text: 'Skip GPS', onPress: () => checkoutMutation.mutate(null) },
      {
        text: 'Use GPS',
        style: 'default',
        onPress: async () => {
          const loc = await acquireLocation();
          checkoutMutation.mutate(loc);
        },
      },
    ]);
  };

  const todayLabel = isCheckedOut ? 'Completed' : isCheckedIn ? 'Punched In' : 'Not Marked';
  const todayColor = isCheckedOut ? '#27AE60' : isCheckedIn ? BRAND.accent : '#E74C3C';

  const applyDateFilter = () => {
    setShowDateFilter(false);
    (historyResult.refetch as () => Promise<any>)();
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    setShowDateFilter(false);
  };

  const tabs: { key: ActiveTab; label: string; icon: string }[] = [
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'calendar', label: 'Calendar', icon: 'calendar-month' },
    { key: 'history', label: 'History', icon: 'history' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <MaterialIcons name={t.icon as any} size={18} color={activeTab === t.key ? BRAND.primary : '#5A7A63'} />
            <RNText style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</RNText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refetchAll(); }} tintColor={BRAND.primary} />}
      >
        {/* TODAY TAB */}
        {activeTab === 'today' && (
          <>
            {/* Today's Punch Card */}
            <View style={styles.todayCard}>
              <View style={styles.todayHeader}>
                <View>
                  <RNText style={styles.todayTitle}>Today's Attendance</RNText>
                  <RNText style={styles.todayDate}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </RNText>
                </View>
                <View style={[styles.todayBadge, { backgroundColor: todayColor + '22' }]}>
                  <RNText style={[styles.todayBadgeText, { color: todayColor }]}>{todayLabel}</RNText>
                </View>
              </View>

              {/* Punch time display */}
              <View style={styles.punchTimeRow}>
                <View style={styles.punchTimeBlock}>
                  <MaterialIcons name="login" size={16} color={BRAND.primary} />
                  <RNText style={styles.punchTimeLabel}>Punch In</RNText>
                  <RNText style={styles.punchTimeValue}>
                    {summary?.checkInTime ? summary.checkInTime.slice(11, 16) : '—'}
                  </RNText>
                </View>
                <View style={styles.punchTimeDivider} />
                <View style={styles.punchTimeBlock}>
                  <MaterialIcons name="logout" size={16} color="#E74C3C" />
                  <RNText style={styles.punchTimeLabel}>Punch Out</RNText>
                  <RNText style={styles.punchTimeValue}>
                    {summary?.checkOutTime ? summary.checkOutTime.slice(11, 16) : '—'}
                  </RNText>
                </View>
                <View style={styles.punchTimeDivider} />
                <View style={styles.punchTimeBlock}>
                  <MaterialIcons name="schedule" size={16} color="#8E44AD" />
                  <RNText style={styles.punchTimeLabel}>Working Hrs</RNText>
                  <RNText style={styles.punchTimeValue}>{summary?.workingHours ?? '—'}</RNText>
                </View>
              </View>

              {/* GPS location info */}
              {summary?.checkInAddress ? (
                <View style={styles.locationRow}>
                  <MaterialIcons name="location-on" size={14} color={BRAND.accent} />
                  <RNText style={styles.locationText} numberOfLines={2}>{summary.checkInAddress}</RNText>
                </View>
              ) : null}

              {/* Captured location preview */}
              {capturedLocation && gpsStatus === 'got' ? (
                <View style={styles.locationRow}>
                  <MaterialIcons name="gps-fixed" size={14} color="#27AE60" />
                  <RNText style={styles.locationText} numberOfLines={2}>
                    {capturedLocation.address ?? `${capturedLocation.latitude.toFixed(5)}, ${capturedLocation.longitude.toFixed(5)}`}
                  </RNText>
                </View>
              ) : null}
              {gpsStatus === 'denied' ? (
                <TouchableOpacity style={styles.locationDenied} onPress={() => Linking.openSettings()}>
                  <MaterialIcons name="location-off" size={14} color="#E74C3C" />
                  <RNText style={styles.locationDeniedText}>Location denied — tap to enable in Settings</RNText>
                </TouchableOpacity>
              ) : null}

              {/* Punch buttons */}
              {summaryLoading ? (
                <ActivityIndicator color={BRAND.primary} style={{ marginTop: 12 }} />
              ) : isCheckedOut ? (
                <View style={styles.completedRow}>
                  <MaterialIcons name="check-circle" size={18} color="#27AE60" />
                  <RNText style={styles.completedText}>Attendance marked for today</RNText>
                </View>
              ) : (
                <View style={styles.punchBtnRow}>
                  {!isCheckedIn ? (
                    <TouchableOpacity
                      style={[styles.punchBtn, styles.punchBtnIn]}
                      onPress={handlePunchIn}
                      disabled={actionLoading}
                      activeOpacity={0.82}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          <MaterialIcons name="fingerprint" size={22} color="#FFF" />
                          <RNText style={styles.punchBtnText}>Punch In</RNText>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.punchBtn, styles.punchBtnOut]}
                      onPress={handlePunchOut}
                      disabled={actionLoading}
                      activeOpacity={0.82}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          <MaterialIcons name="logout" size={22} color="#FFF" />
                          <RNText style={styles.punchBtnText}>Punch Out</RNText>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Summary Stats */}
            <RNText style={styles.sectionTitle}>This Month</RNText>
            {summaryLoading ? (
              <ActivityIndicator color={BRAND.primary} style={{ marginVertical: 16 }} />
            ) : (
              <>
                <View style={styles.statsRow}>
                  <StatCard value={summary?.monthlyPresent ?? 0} label="Present" color="#27AE60" icon="check-circle" />
                  <StatCard value={summary?.totalAbsent ?? 0} label="Absent" color="#E74C3C" icon="cancel" />
                  <StatCard value={summary?.lateMarks ?? 0} label="Late" color="#F39C12" icon="access-time" />
                  <StatCard value={summary?.halfDays ?? 0} label="Half Day" color="#E67E22" icon="looks-one" />
                </View>
                <View style={styles.statsRow}>
                  <StatCard value={summary?.totalLeave ?? 0} label="Leave" color="#3498DB" icon="event-busy" />
                  <StatCard value={summary?.missedPunches ?? 0} label="Missed" color="#922B21" icon="warning" />
                  <StatCard value={`${summary?.attendancePercentage ?? 0}%`} label="Attendance" color={BRAND.primary} icon="trending-up" />
                  <StatCard value={summary?.monthlyTotal ?? 0} label="Working" color={BRAND.primaryDark} icon="work" />
                </View>
              </>
            )}

            {/* Weekly Summary */}
            {summary && (
              <>
                <RNText style={styles.sectionTitle}>This Week</RNText>
                <View style={styles.weekCard}>
                  <View style={styles.weekBarRow}>
                    {Array.from({ length: summary.weeklyTotal || 5 }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.weekBar,
                          { backgroundColor: i < (summary.weeklyPresent ?? 0) ? '#27AE60' : '#F0F7F3' },
                        ]}
                      />
                    ))}
                  </View>
                  <RNText style={styles.weekText}>
                    {summary.weeklyPresent ?? 0} of {summary.weeklyTotal ?? 5} days present this week
                  </RNText>
                </View>
              </>
            )}
          </>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <>
            <RNText style={styles.sectionTitle}>Monthly Calendar</RNText>
            {historyLoading ? (
              <ActivityIndicator color={BRAND.primary} style={{ marginVertical: 24 }} />
            ) : (
              <MiniCalendar history={history} />
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <>
            <View style={styles.historyHeader}>
              <RNText style={styles.sectionTitle}>Attendance History</RNText>
              <TouchableOpacity
                style={[styles.filterBtn, (dateFrom || dateTo) && styles.filterBtnActive]}
                onPress={() => setShowDateFilter(true)}
              >
                <MaterialIcons name="filter-list" size={16} color={dateFrom || dateTo ? '#FFF' : BRAND.primary} />
                <RNText style={[styles.filterBtnText, (dateFrom || dateTo) && styles.filterBtnTextActive]}>
                  {dateFrom || dateTo ? 'Filtered' : 'Filter'}
                </RNText>
              </TouchableOpacity>
            </View>

            {dateFrom || dateTo ? (
              <View style={styles.activeFilterRow}>
                <RNText style={styles.activeFilterText}>
                  {dateFrom && `From: ${dateFrom}`}{dateFrom && dateTo ? '  · ' : ''}{dateTo && `To: ${dateTo}`}
                </RNText>
                <TouchableOpacity onPress={clearDateFilter}>
                  <MaterialIcons name="close" size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ) : null}

            {historyLoading ? (
              <ActivityIndicator color={BRAND.primary} style={{ marginVertical: 24 }} />
            ) : history.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialIcons name="event-busy" size={36} color="#C8DFD0" />
                <RNText style={styles.emptyText}>No attendance records found</RNText>
              </View>
            ) : (
              <View style={styles.historyCard}>
                {history.map((item) => <AttendanceRow key={item.id} item={item} />)}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Date Range Filter Modal */}
      <Modal
        visible={showDateFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateFilter(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDateFilter(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <RNText style={styles.modalTitle}>Filter by Date Range</RNText>
          <RNText style={styles.modalHint}>Format: YYYY-MM-DD (e.g. 2025-01-01)</RNText>
          <RNText style={styles.modalFieldLabel}>From Date</RNText>
          <TextInput
            style={styles.modalInput}
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholder="2025-01-01"
            placeholderTextColor="#B0C8B8"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <RNText style={styles.modalFieldLabel}>To Date</RNText>
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
            <TouchableOpacity style={styles.clearBtn} onPress={clearDateFilter}>
              <RNText style={styles.clearBtnText}>Clear</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyDateFilter}>
              <RNText style={styles.applyBtnText}>Apply</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: BRAND.primary },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#5A7A63' },
  tabLabelActive: { color: BRAND.primary },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  todayTitle: { fontSize: 16, fontWeight: '700', color: '#1A2D1E' },
  todayDate: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
  todayBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  todayBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  punchTimeRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FDFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  punchTimeBlock: { flex: 1, alignItems: 'center', gap: 2 },
  punchTimeDivider: { width: 1, backgroundColor: '#E8F0EC' },
  punchTimeLabel: { fontSize: 10, color: '#5A7A63', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  punchTimeValue: { fontSize: 17, fontWeight: '800', color: '#1A2D1E' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F0FFF5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  locationText: { flex: 1, fontSize: 11, color: '#2D6A4F', lineHeight: 16 },
  locationDenied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  locationDeniedText: { flex: 1, fontSize: 11, color: '#E74C3C', lineHeight: 16 },
  punchBtnRow: { flexDirection: 'row', gap: 10 },
  punchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    height: 48,
  },
  punchBtnIn: { backgroundColor: BRAND.primary },
  punchBtnOut: { backgroundColor: '#E74C3C' },
  punchBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  completedText: { color: '#27AE60', fontSize: 14, fontWeight: '600' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
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
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#5A7A63', fontWeight: '600', marginTop: 3, textAlign: 'center' },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  weekBarRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  weekBar: { flex: 1, height: 10, borderRadius: 5 },
  weekText: { fontSize: 13, color: '#5A7A63', fontWeight: '500' },
  calCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calTitle: { fontSize: 15, fontWeight: '700', color: '#1A2D1E' },
  calDayHeader: { flexDirection: 'row', marginBottom: 4 },
  calDayName: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: BRAND.primary, letterSpacing: 0.3 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  calCellToday: {
    backgroundColor: BRAND.primaryLight,
    borderRadius: 8,
  },
  calDayNum: { fontSize: 13, fontWeight: '500', color: '#1A2D1E' },
  calDayNumToday: { color: BRAND.primary, fontWeight: '700' },
  calDot: { width: 5, height: 5, borderRadius: 3, marginTop: 1 },
  calLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F7F3' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, color: '#5A7A63', fontWeight: '500' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterBtnActive: { backgroundColor: BRAND.primary },
  filterBtnText: { fontSize: 11, fontWeight: '700', color: BRAND.primary },
  filterBtnTextActive: { color: '#FFF' },
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeFilterText: { fontSize: 12, color: BRAND.primaryDark, fontWeight: '600' },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 13, fontWeight: '600', color: '#1A2D1E' },
  historyTimes: { fontSize: 11, color: '#5A7A63', marginTop: 2 },
  statusChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { color: '#5A7A63', fontSize: 14 },
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
