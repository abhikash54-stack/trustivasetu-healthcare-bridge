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
    lenderId: raw.lenderId ?? raw.lender?.id ?? '',
    lenderName: raw.lender?.name ?? raw.lenderName ?? '',
    stage: raw.stage ?? raw.status ?? '',
    statusHistory,
  };
}

export interface LeadFilterParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  clinicId?: string;
  regionId?: string;
  search?: string;
}

export async function fetchLeads(params?: LeadFilterParams): Promise<Lead[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params?.dateTo) query.set('dateTo', params.dateTo);
  if (params?.clinicId) query.set('clinicId', params.clinicId);
  if (params?.regionId) query.set('regionId', params.regionId);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  const response = await apiClient.get(qs ? `/leads?${qs}` : '/leads');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeLead);
}

export async function deleteLead(leadId: string): Promise<void> {
  await apiClient.delete(`/leads/${leadId}`);
}

export async function fetchLeadById(leadId: string): Promise<LeadDetail> {
  const response = await apiClient.get(`/leads/${leadId}`);
  const raw = response.data?.data ?? response.data;
  return normalizeLeadDetail(raw);
}

export interface CreateLeadInput {
  applicantName: string;
  phone: string;
  email: string;
  amount: string;
  lenderId: string;
  clinicId: string;
  applicationDate: string;
  remarks: string;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const payload: any = {
    applicantName: input.applicantName.trim(),
    phone: input.phone.trim(),
  };
  if (input.email.trim()) payload.email = input.email.trim();
  if (input.amount.trim()) payload.amount = Number(input.amount.trim());
  if (input.lenderId.trim()) payload.lenderId = input.lenderId.trim();
  if (input.clinicId.trim()) payload.clinicId = input.clinicId.trim();
  if (input.applicationDate.trim()) payload.applicationDate = input.applicationDate.trim();
  if (input.remarks.trim()) payload.remarks = input.remarks.trim();

  const response = await apiClient.post('/leads', payload);
  const raw = response.data?.data ?? response.data;
  return normalizeLead(raw);
}

export interface UpdateLeadInput {
  applicantName?: string;
  phone?: string;
  amount?: number;
  status?: string;
  approvedAmount?: number;
  disbursedAmount?: number;
  lenderId?: string;
  approvalDate?: string;
  disbursalDate?: string;
  applicationDate?: string;
  remarks?: string;
}

export async function updateLead(leadId: string, input: UpdateLeadInput): Promise<LeadDetail> {
  const payload: any = {};
  if (input.applicantName !== undefined) payload.applicantName = input.applicantName;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.amount !== undefined) payload.amount = input.amount;
  if (input.status !== undefined) payload.status = input.status;
  if (input.approvedAmount !== undefined) payload.approvedAmount = input.approvedAmount;
  if (input.disbursedAmount !== undefined) payload.disbursedAmount = input.disbursedAmount;
  if (input.lenderId !== undefined) payload.lenderId = input.lenderId || null;
  if (input.approvalDate !== undefined) payload.approvalDate = input.approvalDate;
  if (input.disbursalDate !== undefined) payload.disbursalDate = input.disbursalDate;
  if (input.applicationDate !== undefined) payload.applicationDate = input.applicationDate;
  if (input.remarks !== undefined) payload.remarks = input.remarks;

  const response = await apiClient.patch(`/leads/${leadId}`, payload);
  const raw = response.data?.data ?? response.data;
  return normalizeLeadDetail(raw);
}

export async function updateLeadStatus(leadId: string, status: string): Promise<void> {
  await apiClient.patch(`/leads/${leadId}`, { status });
}
