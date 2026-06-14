import { apiClient } from '../api/axios';
import { Region } from '../types/auth';

function normalizeRegion(raw: any): Region {
  return {
    id: raw.id ?? '',
    name: raw.name ?? '',
    code: raw.code ?? '',
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt ?? '',
  };
}

export async function fetchRegions(): Promise<Region[]> {
  const response = await apiClient.get('/regions');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeRegion);
}

export async function createRegion(input: { name: string; code: string }): Promise<Region> {
  const response = await apiClient.post('/regions', input);
  const raw = response.data?.data ?? response.data;
  return normalizeRegion(raw);
}
