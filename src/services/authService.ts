import axios from 'axios';
import { LoginCredentials, UserProfile } from '../types/auth';

const LMS_BASE = 'https://lms.trustivasetu.com';

const authHttp = axios.create({
  baseURL: LMS_BASE,
  timeout: 20000,
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

// Extract Set-Cookie values from a response for manual forwarding.
// React Native's native HTTP stack manages cookies automatically, but Expo Go's
// shared cookie jar can interfere with cross-request cookie forwarding. We extract
// cookies here as a reliable fallback so the CSRF token round-trip always works.
function extractSetCookies(headers: any): string {
  const raw = headers?.['set-cookie'] ?? headers?.['Set-Cookie'];
  if (!raw) return '';
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((c: string) => c.split(';')[0].trim()).join('; ');
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  // Step 1 — CSRF token
  let csrfRes: any;
  try {
    csrfRes = await authHttp.get('/api/auth/csrf');
  } catch (err: any) {
    const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
    if (isTimeout) throw new Error('Request timed out. Check your internet connection.');
    throw new Error(`Cannot reach ${LMS_BASE}. Check your internet connection.`);
  }

  const csrfToken: string = csrfRes.data?.csrfToken ?? '';
  if (!csrfToken) {
    throw new Error('Could not get security token. Please restart the app and try again.');
  }

  // Manually carry the CSRF cookie in case Expo Go's cookie jar doesn't forward it
  const csrfCookies = extractSetCookies(csrfRes.headers);

  // Step 2 — Sign in
  const body = [
    `csrfToken=${encodeURIComponent(csrfToken)}`,
    `callbackUrl=${encodeURIComponent(LMS_BASE)}`,
    `email=${encodeURIComponent(credentials.email)}`,
    `password=${encodeURIComponent(credentials.password)}`,
    'json=true',
  ].join('&');

  const signInHeaders: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (csrfCookies) {
    signInHeaders['Cookie'] = csrfCookies;
  }

  let signInRes: any;
  try {
    signInRes = await authHttp.post('/api/auth/callback/credentials', body, {
      headers: signInHeaders,
    });
  } catch (err: any) {
    throw new Error('Authentication request failed. Please try again.');
  }

  const resultUrl: string = signInRes.data?.url ?? '';
  if (resultUrl.includes('error=')) {
    const match = resultUrl.match(/error=([^&]+)/);
    const code = match ? decodeURIComponent(match[1]) : 'AuthError';
    if (code === 'CredentialsSignin') {
      throw new Error('Invalid email or password.');
    }
    throw new Error(`Sign-in failed (${code}). Please contact your administrator.`);
  }

  // Step 3 — Establish session
  const user = await verifySession();
  if (!user) {
    throw new Error('Sign-in succeeded but the session could not be established. Please try again.');
  }

  return { user };
}

export async function logout(): Promise<void> {
  try {
    const csrfRes = await authHttp.get('/api/auth/csrf');
    const csrfToken: string = csrfRes.data?.csrfToken ?? '';
    if (!csrfToken) return;

    const csrfCookies = extractSetCookies(csrfRes.headers);
    const body = [
      `csrfToken=${encodeURIComponent(csrfToken)}`,
      `callbackUrl=${encodeURIComponent(LMS_BASE)}`,
      'json=true',
    ].join('&');

    await authHttp.post('/api/auth/signout', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(csrfCookies ? { Cookie: csrfCookies } : {}),
      },
    });
  } catch {
    // Best effort — callers clear local state regardless
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
    if (err?.response?.status !== 404) throw err;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await authHttp.post('/api/auth/change-password', { currentPassword, newPassword });
}
