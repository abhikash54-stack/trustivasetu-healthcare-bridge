import { apiClient } from '../api/axios';
import { HRPolicy } from '../types/auth';

export async function fetchPolicies(): Promise<HRPolicy[]> {
  try {
    const response = await apiClient.get<HRPolicy[]>('/hr-policies');
    const raw = (response.data as any)?.data ?? response.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error: any) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
}
