import { apiClient } from '../api/axios';
import { AuditLog } from '../types/auth';

function normalizeLog(raw: any): AuditLog {
  return {
    id: raw.id ?? '',
    action: raw.action ?? '',
    entity: raw.entity ?? '',
    entityId: raw.entityId,
    details: raw.details,
    createdAt: raw.createdAt ?? '',
    user: raw.user,
  };
}

export interface FetchAuditLogsParams {
  page?: number;
  entity?: string;
  action?: string;
}

export interface AuditLogsResult {
  logs: AuditLog[];
  total: number;
  page: number;
}

export async function fetchAuditLogs(params?: FetchAuditLogsParams): Promise<AuditLogsResult> {
  const p: any = { page: params?.page ?? 1, pageSize: 30 };
  if (params?.entity) p.entity = params.entity;
  if (params?.action) p.action = params.action;
  const response = await apiClient.get('/audit-logs', { params: p });
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return {
    logs: raw.map(normalizeLog),
    total: response.data?.total ?? raw.length,
    page: params?.page ?? 1,
  };
}
