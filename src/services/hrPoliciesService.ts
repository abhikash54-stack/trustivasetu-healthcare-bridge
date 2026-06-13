import { apiClient } from '../api/axios';
import { HRPolicy } from '../types/auth';

export async function fetchPolicies(): Promise<HRPolicy[]> {
  const response = await apiClient.get<HRPolicy[]>('/hr-policies');
  return response.data;
}
