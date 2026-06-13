import { apiClient } from '../api/axios';
import { Enquiry, EnquiryDetail } from '../types/auth';

export async function fetchEnquiries(): Promise<Enquiry[]> {
  const response = await apiClient.get('/enquiries/provider');
  return response.data as Enquiry[];
}

export async function fetchEnquiryById(enquiryId: string): Promise<EnquiryDetail> {
  const response = await apiClient.get(`/enquiries/provider/${enquiryId}`);
  return response.data as EnquiryDetail;
}
