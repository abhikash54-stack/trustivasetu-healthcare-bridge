import { LoginCredentials, UserProfile } from '../types/auth';
import { apiClient } from '../api/axios';

interface AuthResponse {
  token: string;
  user: UserProfile;
}

export async function login(credentials: LoginCredentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data as AuthResponse;
}

export async function requestPasswordReset(email: string) {
  await apiClient.post('/auth/forgot-password', { email });
}
