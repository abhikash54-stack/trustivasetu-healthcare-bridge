import { LoginCredentials } from '../types/auth';
import { localLogin } from './localAuthService';

export async function login(credentials: LoginCredentials) {
  return localLogin(credentials.email, credentials.password);
}

export async function requestPasswordReset(_email: string) {
  // Placeholder — will connect to backend API when deployed
}
