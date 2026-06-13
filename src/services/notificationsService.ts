import { apiClient } from '../api/axios';
import { Notification } from '../types/auth';

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await (apiClient as any).get('/notifications');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw as Notification[];
}

// Mark-read endpoints do not exist on the current LMS backend — no-ops.
export async function markNotificationRead(_notificationId: string): Promise<void> {
  return;
}

export async function markAllRead(): Promise<void> {
  return;
}
