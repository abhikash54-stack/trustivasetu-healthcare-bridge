import { apiClient } from '../api/axios';
import { Lender } from '../types/auth';

function normalizeLender(raw: any): Lender {
  return {
    id: raw.id ?? '',
    name: raw.name ?? '',
    code: raw.code ?? '',
    isActive: raw.isActive ?? true,
  };
}

export async function fetchLenders(): Promise<Lender[]> {
  const response = await apiClient.get('/lenders');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeLender);
}

export async function createLender(input: { name: string; code: string }): Promise<Lender> {
  const response = await apiClient.post('/lenders', input);
  const raw = response.data?.data ?? response.data;
  return normalizeLender(raw);
}
