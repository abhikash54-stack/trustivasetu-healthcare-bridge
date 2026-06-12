import { apiClient } from '../api/axios';
import { Lead, LeadDetail } from '../types/auth';

export async function fetchLeads(): Promise<Lead[]> {
  const response = await apiClient.get('/leads');
  return response.data as Lead[];
}

export async function fetchLeadById(leadId: string): Promise<LeadDetail> {
  const response = await apiClient.get(`/leads/${leadId}`);
  return response.data as LeadDetail;
}
