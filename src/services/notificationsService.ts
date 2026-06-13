import { apiClient } from '../api/axios';
import { Notification } from '../types/auth';

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiClient.get('/notifications');
  return response.data as Notification[];
}

// Mark-read endpoints do not exist on the current LMS backend — no-ops.
export async function markNotificationRead(_notificationId: string): Promise<void> {
  return;
}

export async function markAllRead(): Promise<void> {
  return;
}
