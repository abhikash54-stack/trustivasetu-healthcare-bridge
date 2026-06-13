import { apiClient } from '../api/axios';
import { DashboardMetrics } from '../types/auth';

export async function fetchDashboard(): Promise<DashboardMetrics> {
  const response = await (apiClient as any).get('/dashboard');
  const raw = response.data ?? {};

  const trend = Array.isArray(raw.monthlyTrend)
    ? raw.monthlyTrend.map((t: any) => ({ month: t.month ?? '', value: t.leads ?? 0 }))
    : [];

  const targetRaw = raw.target ?? {};

  return {
    totalLeads: raw.totalLeads ?? 0,
    approvedLeads: raw.totalApproved ?? 0,
    disbursedLeads: raw.totalDisbursed ?? 0,
    pendingLeads: (raw.totalLeads ?? 0) - (raw.totalApproved ?? 0),
    approvedValue: raw.totalApprovedValue != null ? String(raw.totalApprovedValue) : '',
    disbursedValue: raw.totalDisbursedValue != null ? String(raw.totalDisbursedValue) : '',
    activeClinics: raw.totalClinics ?? 0,
    topClinic: '',
    leadStatusCounts: {
      PENDING: 0,
      APPROVED: raw.totalApproved ?? 0,
      DISBURSED: raw.totalDisbursed ?? 0,
      REJECTED: 0,
      CANCELLED: 0,
    },
    runRate: {
      target: targetRaw.leadsTarget != null ? String(targetRaw.leadsTarget) : '',
      achieved: targetRaw.achievedLeads != null ? String(targetRaw.achievedLeads) : '',
      percentage: targetRaw.percentage ?? 0,
    },
    trend,
  };
}
