import { Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View, Text as RNText, ActivityIndicator } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import {
  fetchAttendanceSummary,
  fetchAttendanceHistory,
  checkIn,
  checkOut,
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

function SummaryCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: color }]}>
      <RNText style={[styles.summaryValue, { color }]}>{value}</RNText>
      <RNText style={styles.summaryLabel}>{label}</RNText>
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

export function AttendanceScreen() {
  const insets = useSafeAreaInsets();

  const summaryResult = useQuery({
    queryKey: ['attendance', 'summary'],
    queryFn: fetchAttendanceSummary,
  }) as any;
  const summary = summaryResult.data;
  const summaryLoading: boolean = summaryResult.isLoading;

  const historyResult = useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: () => fetchAttendanceHistory(),
  }) as any;
  const history: AttendanceRecord[] = historyResult.data ?? [];
  const historyLoading: boolean = historyResult.isLoading;
  const refetchHistory = () => (historyResult.refetch as () => Promise<any>)();
  const refetchSummary = () => (summaryResult.refetch as () => Promise<any>)();

  const checkinMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: (data: { checkInTime: string }) => {
      Alert.alert('Checked In', `Checked in at ${data.checkInTime.slice(11, 16)}`);
      refetchSummary();
      refetchHistory();
    },
    onError: () => Alert.alert('Error', 'Could not check in. Please try again.'),
  });

  const checkoutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: (data: { checkOutTime: string; workingHours: string }) => {
      Alert.alert('Checked Out', `Checked out at ${data.checkOutTime.slice(11, 16)}\nWorking hours: ${data.workingHours}`);
      refetchSummary();
      refetchHistory();
    },
    onError: () => Alert.alert('Error', 'Could not check out. Please try again.'),
  });

  const isCheckedIn = summary?.todayStatus === 'CHECKED_IN';
  const isCheckedOut = summary?.todayStatus === 'CHECKED_OUT';
  const actionLoading = (checkinMutation as any).isPending || (checkoutMutation as any).isPending;

  const handleAction = () => {
    if (isCheckedIn) {
      Alert.alert('Check Out', 'Mark your checkout for today?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Check Out', onPress: () => checkoutMutation.mutate() },
      ]);
    } else if (!isCheckedOut) {
      Alert.alert('Check In', 'Mark your attendance for today?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Check In', style: 'default', onPress: () => checkinMutation.mutate() },
      ]);
    }
  };

  const todayLabel = isCheckedOut ? 'Completed' : isCheckedIn ? 'In Progress' : 'Not Marked';
  const todayColor = isCheckedOut ? '#27AE60' : isCheckedIn ? BRAND.accent : '#E74C3C';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Today's Card */}
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

        {summary?.checkInTime ? (
          <View style={styles.timesRow}>
            <View style={styles.timeBlock}>
              <MaterialIcons name="login" size={18} color={BRAND.primary} />
              <RNText style={styles.timeLabel}>Check In</RNText>
              <RNText style={styles.timeValue}>{summary.checkInTime.slice(11, 16)}</RNText>
            </View>
            {summary?.checkOutTime ? (
              <View style={styles.timeBlock}>
                <MaterialIcons name="logout" size={18} color={BRAND.primary} />
                <RNText style={styles.timeLabel}>Check Out</RNText>
                <RNText style={styles.timeValue}>{summary.checkOutTime.slice(11, 16)}</RNText>
              </View>
            ) : null}
          </View>
        ) : null}

        {!isCheckedOut ? (
          <TouchableOpacity
            style={[styles.actionButton, isCheckedIn && styles.actionButtonOut]}
            onPress={handleAction}
            disabled={actionLoading || summaryLoading}
            activeOpacity={0.82}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <MaterialIcons
                  name={isCheckedIn ? 'logout' : 'fingerprint'}
                  size={20}
                  color="#FFF"
                />
                <RNText style={styles.actionButtonText}>
                  {isCheckedIn ? 'Check Out' : 'Check In'}
                </RNText>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.completedRow}>
            <MaterialIcons name="check-circle" size={18} color="#27AE60" />
            <RNText style={styles.completedText}>Attendance marked for today</RNText>
          </View>
        )}
      </View>

      {/* Monthly Summary */}
      <RNText style={styles.sectionTitle}>This Month</RNText>
      {summaryLoading ? (
        <ActivityIndicator color={BRAND.primary} style={{ marginVertical: 16 }} />
      ) : (
        <View style={styles.summaryRow}>
          <SummaryCard value={summary?.totalPresent ?? 0} label="Present" color="#27AE60" />
          <SummaryCard value={summary?.totalAbsent ?? 0} label="Absent" color="#E74C3C" />
          <SummaryCard value={summary?.totalLeave ?? 0} label="Leave" color="#3498DB" />
          <SummaryCard value={summary?.totalWorkingDays ?? 0} label="Working" color={BRAND.primary} />
        </View>
      )}

      {/* History */}
      <RNText style={[styles.sectionTitle, { marginTop: 24 }]}>Attendance History</RNText>
      {historyLoading ? (
        <ActivityIndicator color={BRAND.primary} style={{ marginVertical: 16 }} />
      ) : history.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="event-busy" size={36} color="#C8DFD0" />
          <RNText style={styles.emptyText}>No attendance records found</RNText>
        </View>
      ) : (
        <View style={styles.historyCard}>
          {history.map((item) => (
            <AttendanceRow key={item.id} item={item} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20 },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 16,
  },
  todayTitle: { fontSize: 16, fontWeight: '700', color: '#1A2D1E' },
  todayDate: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
  todayBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  todayBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  timesRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  timeBlock: { alignItems: 'center', gap: 2 },
  timeLabel: { fontSize: 11, color: '#5A7A63', fontWeight: '600' },
  timeValue: { fontSize: 18, fontWeight: '700', color: '#1A2D1E' },
  actionButton: {
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonOut: { backgroundColor: '#E74C3C' },
  actionButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  completedText: { color: '#27AE60', fontSize: 14, fontWeight: '600' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: '#5A7A63', fontWeight: '600', marginTop: 4 },
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
});
