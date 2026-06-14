import { apiClient } from '../api/axios';
import { Notification } from '../types/auth';

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiClient.get('/notifications');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw as Notification[];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch('/notifications', { id: notificationId });
}

export async function markAllRead(): Promise<void> {
  await apiClient.patch('/notifications', { id: 'all' });
}
