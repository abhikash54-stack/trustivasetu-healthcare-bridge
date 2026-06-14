import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserProfile } from '../types/auth';
import { getUpcomingOccasions } from './occasionsService';

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
