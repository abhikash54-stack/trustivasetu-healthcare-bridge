import { apiClient } from '../api/axios';
import { Target } from '../types/auth';

function normalizeTarget(raw: any): Target {
  return {
    id: raw.id ?? '',
    year: raw.year ?? new Date().getFullYear(),
    month: raw.month ?? new Date().getMonth() + 1,
    leadsTarget: raw.leadsTarget ?? 0,
    disbursalTarget: raw.disbursalTarget ?? 0,
    userId: raw.userId ?? raw.user?.id,
    regionId: raw.regionId ?? raw.region?.id,
    clinicId: raw.clinicId ?? raw.clinic?.id,
    user: raw.user,
    region: raw.region,
    clinic: raw.clinic,
  };
}

export async function fetchTargets(year: number, month: number): Promise<Target[]> {
  const response = await (apiClient as any).get('/targets', { params: { year, month } });
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeTarget);
}

export interface UpsertTargetInput {
  year: number;
  month: number;
  leadsTarget: number;
  disbursalTarget: number;
  regionId?: string;
  userId?: string;
  clinicId?: string;
}

export async function upsertTarget(input: UpsertTargetInput): Promise<Target> {
  const payload: any = { ...input };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
  const response = await (apiClient as any).post('/targets', payload);
  const raw = response.data?.data ?? response.data;
  return normalizeTarget(raw);
}
