import { apiClient } from '../api/axios';
import { Lead, LeadDetail } from '../types/auth';

function normalizeLead(raw: any): Lead {
  return {
    id: raw.id ?? '',
    applicantName: raw.applicantName ?? '',
    clinicName: raw.clinic?.name ?? '',
    source: raw.enquiryType ?? '',
    status: raw.status ?? '',
    assignedTo: raw.createdBy?.name ?? raw.assignedTo ?? '',
    updatedAt: raw.updatedAt ?? '',
    amount: raw.amount != null ? String(raw.amount) : '',
  };
}

function normalizeLeadDetail(raw: any): LeadDetail {
  const statusHistory = Array.isArray(raw.statusHistory)
    ? raw.statusHistory.map((h: any) => ({
        status: h.status ?? '',
        updatedAt: h.updatedAt ?? h.createdAt ?? '',
        note: h.note ?? h.remarks ?? '',
      }))
    : [];

  return {
    ...normalizeLead(raw),
    phone: raw.phone ?? raw.mobile ?? '',
    email: raw.email ?? '',
    approvedAmount: raw.approvedAmount != null ? String(raw.approvedAmount) : '',
    disbursedAmount: raw.disbursedAmount != null ? String(raw.disbursedAmount) : '',
    applicationDate: raw.applicationDate ?? raw.createdAt ?? '',
    approvalDate: raw.approvalDate ?? '',
    disbursalDate: raw.disbursalDate ?? '',
    remarks: raw.remarks ?? '',
    lenderName: raw.lender?.name ?? raw.lenderName ?? '',
    stage: raw.stage ?? raw.status ?? '',
    statusHistory,
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

export interface CreateLeadInput {
  applicantName: string;
  phone: string;
  email: string;
  amount: string;
  enquiryType: string;
  clinicId: string;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const payload: any = {
    applicantName: input.applicantName.trim(),
    phone: input.phone.trim(),
    enquiryType: input.enquiryType,
    clinicId: input.clinicId.trim() || undefined,
  };
  if (input.email.trim()) payload.email = input.email.trim();
  if (input.amount.trim()) payload.amount = Number(input.amount.trim());

  const response = await (apiClient as any).post('/leads', payload);
  const raw = response.data?.data ?? response.data;
  return normalizeLead(raw);
}

export async function updateLeadStatus(leadId: string, status: string): Promise<void> {
  await (apiClient as any).patch(`/leads/${leadId}`, { status });
}
