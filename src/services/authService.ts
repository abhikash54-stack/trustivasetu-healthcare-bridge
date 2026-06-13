import axios from 'axios';
import { LoginCredentials, UserProfile } from '../types/auth';

const LMS_BASE = 'https://lms.trustivasetu.com';

// Dedicated instance for NextAuth.js cookie-based auth flow.
// Cookies are managed transparently by the OS HTTP stack (NSURLSession / OkHttp).
const authHttp = axios.create({
  baseURL: LMS_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
}) as any;

export interface LoginResult {
  user: UserProfile;
}

function mapSessionUser(u: any, fallbackEmail?: string): UserProfile {
  return {
    id: String(u.id ?? u.sub ?? u.userId ?? ''),
    name: String(u.name ?? ''),
    email: String(u.email ?? fallbackEmail ?? ''),
    phone: String(u.phone ?? u.mobile ?? u.phoneNumber ?? ''),
    role: String(u.role ?? 'EMPLOYEE'),
    status: u.status ?? 'ACTIVE',
  };
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  // Step 1: get CSRF token (native cookie jar stores CSRF cookies automatically)
  const csrfRes = await authHttp.get('/api/auth/csrf');
  const csrfToken: string = csrfRes.data?.csrfToken ?? '';

  if (!csrfToken) {
    throw new Error('Could not get security token. Please check your connection.');
  }

  // Step 2: sign in (CSRF cookie sent automatically by native cookie jar)
  const body = [
    `csrfToken=${encodeURIComponent(csrfToken)}`,
    `callbackUrl=${encodeURIComponent(LMS_BASE)}`,
    `email=${encodeURIComponent(credentials.email)}`,
    `password=${encodeURIComponent(credentials.password)}`,
    'json=true',
  ].join('&');

  const signInRes = await authHttp.post(
    '/api/auth/callback/credentials',
    body,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  const resultUrl: string = signInRes.data?.url ?? '';
  if (resultUrl.includes('error=')) {
    const match = resultUrl.match(/error=([^&]+)/);
    const code = match ? decodeURIComponent(match[1]) : 'AuthError';
    if (code === 'CredentialsSignin') {
      throw new Error('Invalid email or password.');
    }
    throw new Error(`Authentication failed: ${code}`);
  }

  // Step 3: fetch session to get user profile (session cookie sent automatically)
  const user = await verifySession();
  if (!user) {
    throw new Error('Login succeeded but session could not be established. Please try again.');
  }

  return { user };
}

export async function logout(): Promise<void> {
  try {
    const csrfRes = await authHttp.get('/api/auth/csrf');
    const csrfToken: string = csrfRes.data?.csrfToken ?? '';
    if (!csrfToken) return;

    const body = [
      `csrfToken=${encodeURIComponent(csrfToken)}`,
      `callbackUrl=${encodeURIComponent(LMS_BASE)}`,
      'json=true',
    ].join('&');

    await authHttp.post('/api/auth/signout', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  } catch {
    // Best effort — local state is cleared by callers regardless
  }
}

export async function verifySession(): Promise<UserProfile | null> {
  try {
    const res = await authHttp.get('/api/auth/session');
    const u = res.data?.user;
    if (!u) return null;
    return mapSessionUser(u);
  } catch {
    return null;
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await authHttp.post('/api/auth/forgot-password', { email });
  } catch (err: any) {
    // 404 = endpoint not implemented on this LMS — treat as success
    if (err?.response?.status !== 404) throw err;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await authHttp.post('/api/auth/change-password', { currentPassword, newPassword });
}
