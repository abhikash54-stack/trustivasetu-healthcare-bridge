import axios from 'axios';
import { ENV } from '../config/environment';

const http = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
}) as any;

export interface HospitalRecord {
  id: string;
  name: string;
  state?: string;
  city?: string;
  area?: string;
  address?: string;
  available?: boolean;
}

export interface HospitalPageResult {
  items: HospitalRecord[];
  page: number;
  hasMore: boolean;
  total: number;
}

export interface HospitalFilters {
  state?: string;
  city?: string;
  area?: string;
  page?: number;
  limit?: number;
}

export interface HospitalAssignmentInput {
  hospitalId?: string;
  inviteCode?: string;
  qrCode?: string;
}

function normalizeHospital(raw: any): HospitalRecord {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? 'Hospital'),
    state: raw.state ?? raw.stateName ?? '',
    city: raw.city ?? raw.cityName ?? '',
    area: raw.area ?? raw.locality ?? raw.areaName ?? '',
    address: raw.address ?? raw.location ?? '',
    available: raw.available ?? true,
  };
}

export async function fetchHospitals(filters: HospitalFilters, token?: string): Promise<HospitalPageResult> {
  const params = {
    state: filters.state?.trim() || undefined,
    city: filters.city?.trim() || undefined,
    area: filters.area?.trim() || undefined,
    page: filters.page ?? 1,
    limit: filters.limit ?? 6,
  };

  try {
    const response = await http.get('/public/hospitals', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      params,
    });

    const rawItems = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
    const items = rawItems.map(normalizeHospital);
    const hasMore = Boolean(response.data?.hasMore ?? false);
    const total = Number(response.data?.total ?? items.length ?? 0);

    return { items, page: Number(params.page ?? 1), hasMore, total };
  } catch (error: any) {
    // TODO: backend should expose a filtered hospital endpoint with pagination metadata.
    if (error?.response?.status === 404 || error?.response?.status === 501) {
      return { items: [], page: Number(params.page ?? 1), hasMore: false, total: 0 };
    }
    throw new Error(error?.message ?? 'Could not load hospitals right now.');
  }
}

export async function assignHospitalAccess(token: string, input: HospitalAssignmentInput): Promise<{ success: true; message: string }> {
  try {
    const response = await http.post(
      '/public/hospital/assign',
      {
        hospitalId: input.hospitalId ?? null,
        inviteCode: input.inviteCode?.trim() || null,
        qrCode: input.qrCode?.trim() || null,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data as { success: true; message: string };
  } catch (error: any) {
    // TODO: backend should verify invite code or QR payload and return assignment status.
    throw new Error(error?.message ?? 'Hospital assignment is not available yet.');
  }
}
