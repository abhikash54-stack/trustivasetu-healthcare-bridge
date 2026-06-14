import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserProfile } from '../types/auth';
import { getUpcomingOccasions } from './occasionsService';

const ATTENDANCE_PUNCH_IN_ID = 'att_daily_punchin';
const ATTENDANCE_PUNCH_OUT_ID = 'att_daily_punchout';
const ATTENDANCE_SUMMARY_ID = 'att_daily_summary';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleOccasionNotifications(user: UserProfile): Promise<void> {
  if (Platform.OS === 'web') return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  // Cancel previous occasion notifications before rescheduling
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of existing) {
    if ((n.content.data as any)?.source === 'occasion') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const upcoming = getUpcomingOccasions(user as any, 7);

  for (const entry of upcoming) {
    const { occasion, daysAway } = entry;
    if (daysAway > 7) continue;

    const triggerDate = new Date();
    triggerDate.setDate(triggerDate.getDate() + daysAway);
    triggerDate.setHours(9, 0, 0, 0);

    if (triggerDate <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${occasion.emoji} ${occasion.label}`,
        body: occasion.message,
        data: { source: 'occasion', type: occasion.type },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}

export async function scheduleAttendanceDailyReminders(): Promise<void> {
  if (Platform.OS === 'web') return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  // Cancel existing attendance reminders before rescheduling
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const attendanceIds = new Set([ATTENDANCE_PUNCH_IN_ID, ATTENDANCE_PUNCH_OUT_ID, ATTENDANCE_SUMMARY_ID]);
  for (const n of existing) {
    if (attendanceIds.has(n.identifier) || (n.content.data as any)?.source === 'attendance') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Daily punch-in reminder at 9:30 AM
  await Notifications.scheduleNotificationAsync({
    identifier: ATTENDANCE_PUNCH_IN_ID,
    content: {
      title: '🕘 Punch In Reminder',
      body: "Don't forget to mark your attendance for today!",
      data: { source: 'attendance', type: 'punch_in' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 30,
    },
  });

  // Daily punch-out reminder at 6:30 PM
  await Notifications.scheduleNotificationAsync({
    identifier: ATTENDANCE_PUNCH_OUT_ID,
    content: {
      title: '🕕 Punch Out Reminder',
      body: 'Time to punch out! Tap to mark your check-out.',
      data: { source: 'attendance', type: 'punch_out' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 30,
    },
  });

  // Daily attendance summary at 8 PM
  await Notifications.scheduleNotificationAsync({
    identifier: ATTENDANCE_SUMMARY_ID,
    content: {
      title: '📋 Daily Attendance Summary',
      body: 'Check your attendance record for today in the app.',
      data: { source: 'attendance', type: 'summary' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export async function cancelAttendanceReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(ATTENDANCE_PUNCH_IN_ID);
  } catch { /* ok */ }
  try {
    await Notifications.cancelScheduledNotificationAsync(ATTENDANCE_PUNCH_OUT_ID);
  } catch { /* ok */ }
  try {
    await Notifications.cancelScheduledNotificationAsync(ATTENDANCE_SUMMARY_ID);
  } catch { /* ok */ }
}
