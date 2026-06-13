import { apiClient } from '../api/axios';
import { ManagedUser, UserStatus } from '../types/auth';

export async function listUsers(): Promise<ManagedUser[]> {
  const { data } = await apiClient.get<ManagedUser[]>('/users');
  return data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}): Promise<ManagedUser> {
  const { data } = await apiClient.post<ManagedUser>('/users', payload);
  return data;
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  await apiClient.put(`/users/${userId}/role`, { role });
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  await apiClient.put(`/users/${userId}/status`, { status });
}

export async function adminResetPassword(userId: string, newPassword: string): Promise<void> {
  await apiClient.put(`/users/${userId}/reset-password`, { newPassword });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
