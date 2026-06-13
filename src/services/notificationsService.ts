import { apiClient } from '../api/axios';
import { Notification } from '../types/auth';

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<Notification[]>('/notifications');
  return response.data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.put(`/notifications/${notificationId}/read`);
}

export async function markAllRead(): Promise<void> {
  await apiClient.put('/notifications/read-all');
}
