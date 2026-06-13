import axios from 'axios';
import Constants from 'expo-constants';
import { tokenManager } from './tokenManager';
import { saveAuthTokens, clearAuthState } from '../services/storageService';

const BASE_URL: string =
  (Constants.expoConfig?.extra?.API_BASE_URL as string | undefined) ??
  'https://api.trustivasetuhealth.com';

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

const _public = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
}) as any;

const _api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
}) as any;

export const publicClient: HttpClient = _public;
export const apiClient: HttpClient = _api;

_api.interceptors.request.use((config: any) => {
  const token = tokenManager.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

function drainQueue(token: string): void {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

function rejectQueue(): void {
  pendingQueue.forEach((cb) => cb(''));
  pendingQueue = [];
}

_api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const original = error?.config;
    const status: number | undefined = error?.response?.status;

    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    const storedRefresh = tokenManager.getRefreshToken();
    if (!storedRefresh) {
      await clearAuthState();
      tokenManager.clearTokens();
      tokenManager.onSessionExpired();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        pendingQueue.push((newToken: string) => {
          if (!newToken) { reject(error); return; }
          if (original.headers) {
            original.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve();
        });
      }).then(() => _api.request(original));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await _public.post(
        '/auth/refresh',
        { refreshToken: storedRefresh },
      ) as AxiosResponse<{ token: string; refreshToken: string }>;

      const { token: newToken, refreshToken: newRefreshToken } = data;
      tokenManager.setTokens(newToken, newRefreshToken);
      await saveAuthTokens(newToken, newRefreshToken);
      drainQueue(newToken);

      if (original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
      }
      return _api.request(original);
    } catch (refreshError) {
      rejectQueue();
      await clearAuthState();
      tokenManager.clearTokens();
      tokenManager.onSessionExpired();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
