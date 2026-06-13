import { publicClient, apiClient } from '../api/axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await publicClient.post<AuthResponse>('/auth/login', credentials);
  return data;
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const { data } = await publicClient.post<AuthResponse>('/auth/register', credentials);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout').catch(() => {});
}

export async function requestPasswordReset(email: string): Promise<void> {
  await publicClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await publicClient.post('/auth/reset-password', { token, newPassword });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/auth/change-password', { currentPassword, newPassword });
}
