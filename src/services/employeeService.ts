import { apiClient } from '../api/axios';
import { Employee } from '../types/auth';

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const response = await apiClient.get<Employee[]>('/employees');
    const raw = (response.data as any)?.data ?? response.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error: any) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
}
