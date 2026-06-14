import { apiClient } from '../api/axios';
import { DashboardMetrics, RecentLead } from '../types/auth';

export async function fetchDashboard(): Promise<DashboardMetrics> {
  const [dashRes, activityRes] = await Promise.allSettled([
    apiClient.get('/dashboard'),
    apiClient.get('/activity'),
  ]);

  const raw = dashRes.status === 'fulfilled' ? (dashRes.value.data ?? {}) : {};
  const activityRaw = activityRes.status === 'fulfilled' ? (activityRes.value.data ?? {}) : {};

  const trend = Array.isArray(raw.monthlyTrend)
    ? raw.monthlyTrend.map((t: any) => ({ month: t.month ?? '', value: t.leads ?? 0 }))
    : [];

  const targetRaw = raw.target ?? {};

  const recentLeads: RecentLead[] = Array.isArray(activityRaw.recentLeads)
    ? activityRaw.recentLeads.map((l: any) => ({
        id: l.id ?? '',
        applicantName: l.applicantName ?? '',
        status: l.status ?? '',
        amount: l.amount ?? 0,
        clinicName: l.clinic?.name ?? '',
        createdAt: l.createdAt ?? '',
      }))
    : [];

  const totalLeads = raw.totalLeads ?? 0;
  const approvedLeads = raw.totalApproved ?? 0;
  const disbursedLeads = raw.totalDisbursed ?? 0;

  return {
    totalLeads,
    approvedLeads,
    disbursedLeads,
    pendingLeads: activityRaw.pendingCount ?? (totalLeads - approvedLeads),
    rejectedLeads: raw.totalRejected ?? 0,
    approvedValue: raw.totalApprovedValue != null ? String(raw.totalApprovedValue) : '',
    disbursedValue: raw.totalDisbursedValue != null ? String(raw.totalDisbursedValue) : '',
    totalLeadValue: raw.totalLeadValue != null ? String(raw.totalLeadValue) : '',
    approvalRate: typeof raw.approvalRate === 'number' ? Math.round(raw.approvalRate) : (totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0),
    disbursalRate: typeof raw.disbursalRate === 'number' ? Math.round(raw.disbursalRate) : (approvedLeads > 0 ? Math.round((disbursedLeads / approvedLeads) * 100) : 0),
    activeClinics: raw.totalClinics ?? 0,
    topClinic: '',
    leadStatusCounts: {
      PENDING: activityRaw.pendingCount ?? 0,
      APPROVED: approvedLeads,
      DISBURSED: disbursedLeads,
      REJECTED: raw.totalRejected ?? 0,
      CANCELLED: raw.totalCancelled ?? 0,
    },
    runRate: {
      target: targetRaw.leadsTarget != null ? String(targetRaw.leadsTarget) : '',
      achieved: targetRaw.achievedLeads != null ? String(targetRaw.achievedLeads) : '',
      percentage: targetRaw.percentage ?? 0,
    },
    trend,
    recentLeads,
  };
}
