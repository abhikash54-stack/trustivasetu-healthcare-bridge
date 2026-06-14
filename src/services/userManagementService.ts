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
  const response = await apiClient.get('/users');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeUser);
}

export async function createUser(payload: {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  regionIds?: string[];
}): Promise<ManagedUser> {
  const body: Record<string, unknown> = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    password: payload.password,
  };
  if (payload.regionIds && payload.regionIds.length > 0) {
    body.regionIds = payload.regionIds;
  }
  const response = await apiClient.post('/users', body);
  return normalizeUser(response.data?.data ?? response.data);
}

export async function updateUser(userId: string, payload: {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  regionIds?: string[];
}): Promise<ManagedUser> {
  const response = await apiClient.patch(`/users/${userId}`, payload);
  return normalizeUser(response.data?.data ?? response.data);
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  await apiClient.patch(`/users/${userId}`, { role });
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  const isActive = status === 'ACTIVE';
  await apiClient.patch(`/users/${userId}`, { isActive });
}

export async function adminResetPassword(userId: string, newPassword: string): Promise<void> {
  await apiClient.patch(`/users/${userId}`, { password: newPassword });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
