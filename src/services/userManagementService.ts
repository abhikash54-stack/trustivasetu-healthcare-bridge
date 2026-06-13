import { apiClient } from '../api/axios';
import { ManagedUser, UserStatus } from '../types/auth';

function normalizeUser(raw: any): ManagedUser {
  return {
    id: raw.id ?? '',
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    role: raw.role ?? '',
    status: (raw.isActive ? 'ACTIVE' : 'INACTIVE') as UserStatus,
    createdAt: raw.createdAt ?? '',
  };
}

export async function listUsers(): Promise<ManagedUser[]> {
  const response = await (apiClient as any).get('/users');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeUser);
}

export async function createUser(payload: {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}): Promise<ManagedUser> {
  const response = await (apiClient as any).post('/users', payload);
  return normalizeUser(response.data?.data ?? response.data);
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  await (apiClient as any).put(`/users/${userId}/role`, { role });
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  await (apiClient as any).put(`/users/${userId}/status`, { status });
}

export async function adminResetPassword(userId: string, newPassword: string): Promise<void> {
  await (apiClient as any).put(`/users/${userId}/reset-password`, { newPassword });
}

export async function deleteUser(userId: string): Promise<void> {
  await (apiClient as any).delete(`/users/${userId}`);
}
