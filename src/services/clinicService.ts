import { apiClient } from '../api/axios';
import { Clinic, ClinicDetail } from '../types/auth';

export async function fetchClinics(): Promise<Clinic[]> {
  const response = await apiClient.get('/clinics');
  return response.data as Clinic[];
}

export async function fetchClinicById(clinicId: string): Promise<ClinicDetail> {
  const response = await apiClient.get(`/clinics/${clinicId}`);
  return response.data as ClinicDetail;
}
