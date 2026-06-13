import { apiClient } from '../api/axios';
import { Enquiry, EnquiryDetail } from '../types/auth';

function normalizeEnquiry(raw: any): Enquiry {
  return {
    id: raw.id ?? '',
    title: raw.clinicName ?? raw.title ?? '',
    status: raw.status ?? '',
    patientName: raw.contactPerson ?? raw.patientName ?? '',
    requestedAt: raw.createdAt ?? raw.requestedAt ?? '',
  };
}

function normalizeEnquiryDetail(raw: any): EnquiryDetail {
  return {
    ...normalizeEnquiry(raw),
    clinicName: raw.clinicName ?? '',
    enquiryType: raw.enquiryType ?? '',
    hospitalName: raw.clinicName ?? '',
    mobileNumber: raw.mobile ?? raw.contactNumber ?? '',
    treatmentName: raw.treatmentName ?? '',
    financingRequired: raw.financingRequired != null ? String(raw.financingRequired) : '',
    remarks: raw.remarks ?? '',
    referenceId: raw.externalId ?? raw.referenceId ?? '',
  };
}

export async function fetchEnquiries(): Promise<Enquiry[]> {
  const response = await (apiClient as any).get('/enquiries/provider');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeEnquiry);
}

export async function fetchEnquiryById(enquiryId: string): Promise<EnquiryDetail> {
  const response = await (apiClient as any).get(`/enquiries/provider/${enquiryId}`);
  const raw = response.data?.data ?? response.data;
  return normalizeEnquiryDetail(raw);
}
