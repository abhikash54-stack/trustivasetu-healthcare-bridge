import { apiClient } from '../api/axios';
import { Lead, LeadDetail } from '../types/auth';

function normalizeLead(raw: any): Lead {
  return {
    id: raw.id ?? '',
    applicantName: raw.applicantName ?? '',
    clinicName: raw.clinic?.name ?? '',
    source: raw.enquiryType ?? '',
    status: raw.status ?? '',
    assignedTo: raw.createdBy?.name ?? '',
    updatedAt: raw.updatedAt ?? '',
    amount: raw.amount != null ? String(raw.amount) : '',
  };
}

function normalizeLeadDetail(raw: any): LeadDetail {
  return {
    ...normalizeLead(raw),
    phone: raw.phone ?? '',
    email: raw.email ?? '',
    approvedAmount: raw.approvedAmount != null ? String(raw.approvedAmount) : '',
    disbursedAmount: raw.disbursedAmount != null ? String(raw.disbursedAmount) : '',
    applicationDate: raw.applicationDate ?? '',
    approvalDate: raw.approvalDate ?? '',
    disbursalDate: raw.disbursalDate ?? '',
    remarks: raw.remarks ?? '',
    lenderName: raw.lender?.name ?? '',
    stage: raw.status ?? '',
    statusHistory: [],
  };
}

export async function fetchLeads(): Promise<Lead[]> {
  const response = await (apiClient as any).get('/leads');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeLead);
}

export async function fetchLeadById(leadId: string): Promise<LeadDetail> {
  const response = await (apiClient as any).get(`/leads/${leadId}`);
  const raw = response.data?.data ?? response.data;
  return normalizeLeadDetail(raw);
}
