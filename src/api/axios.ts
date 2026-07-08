import axios from 'axios';
import { ENV } from '../config/environment';
import { tokenManager } from './tokenManager';
import { clearUser } from '../services/storageService';
import { verifySession } from '../services/authService';

interface AxiosResponse<T = any> {
  data: T;
  status: number;
  headers: any;
}

interface HttpClient {
  get: <T = any>(url: string, config?: any) => Promise<AxiosResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>;
  patch: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>;
  delete: <T = any>(url: string, config?: any) => Promise<AxiosResponse<T>>;
  request: <T = any>(config: any) => Promise<AxiosResponse<T>>;
}

// Session is managed by the OS-level cookie jar (NSURLSession / OkHttp).
// withCredentials: true ensures the native layer includes session cookies.
const _public = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
}) as any;

const _api = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
}) as any;

function ensureSecureRequest(config: any) {
  const url = String(config.baseURL ?? config.url ?? '');
  if (!url.startsWith('https://')) {
    throw new Error(`Blocked insecure request: ${url}`);
  }
  return config;
}

_public.interceptors.request.use(ensureSecureRequest, (error: any) => Promise.reject(error));
_api.interceptors.request.use(ensureSecureRequest, (error: any) => Promise.reject(error));

export const publicClient: HttpClient = _public;
export const apiClient: HttpClient = _api;

_api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const status: number | undefined = error?.response?.status;

    if (status === 401) {
      const user = await verifySession().catch(() => null);
      if (!user) {
        await clearUser().catch(() => {});
        tokenManager.onSessionExpired();
      }
    }

    return Promise.reject(error);
  },
);
