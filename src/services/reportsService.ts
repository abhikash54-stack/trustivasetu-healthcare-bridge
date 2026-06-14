import { apiClient } from '../api/axios';
import { MonthlyReport, RegionReport, RMReport, LenderReport } from '../types/auth';

export async function fetchMonthlyReport(months: number = 6): Promise<MonthlyReport[]> {
  const response = await apiClient.get('/reports', { params: { type: 'monthly', months } });
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map((r: any): MonthlyReport => ({
    period: r.period ?? '',
    month: r.month ?? r.period ?? '',
    totalLeads: r.totalLeads ?? 0,
    approved: r.approved ?? 0,
    disbursed: r.disbursed ?? 0,
    leadValue: r.leadValue ?? 0,
    approvedValue: r.approvedValue ?? 0,
    disbursedValue: r.disbursedValue ?? 0,
    approvalRate: r.approvalRate ?? 0,
    disbursalRate: r.disbursalRate ?? 0,
  }));
}

export async function fetchRegionReport(): Promise<RegionReport[]> {
  const response = await apiClient.get('/reports', { params: { type: 'region' } });
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map((r: any): RegionReport => ({
    id: r.id ?? '',
    name: r.name ?? '',
    totalLeads: r.totalLeads ?? 0,
    approved: r.approved ?? 0,
    disbursed: r.disbursed ?? 0,
    leadValue: r.leadValue ?? 0,
    disbursedValue: r.disbursedValue ?? 0,
    approvalRate: r.approvalRate ?? 0,
  }));
}

export async function fetchRMReport(): Promise<RMReport[]> {
  const response = await apiClient.get('/reports', { params: { type: 'rm' } });
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map((r: any): RMReport => ({
    id: r.id ?? '',
    name: r.name ?? '',
    role: r.role ?? '',
    totalLeads: r.totalLeads ?? 0,
    approved: r.approved ?? 0,
    disbursed: r.disbursed ?? 0,
    leadValue: r.leadValue ?? 0,
    disbursedValue: r.disbursedValue ?? 0,
    approvalRate: r.approvalRate ?? 0,
  }));
}

export async function fetchLenderReport(): Promise<LenderReport[]> {
  const response = await apiClient.get('/reports', { params: { type: 'lender' } });
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map((r: any): LenderReport => ({
    id: r.id ?? '',
    name: r.name ?? '',
    code: r.code ?? '',
    totalLeads: r.totalLeads ?? 0,
    approved: r.approved ?? 0,
    disbursed: r.disbursed ?? 0,
    approvedValue: r.approvedValue ?? 0,
    disbursedValue: r.disbursedValue ?? 0,
    approvalRate: r.approvalRate ?? 0,
    disbursalRate: r.disbursalRate ?? 0,
  }));
}
