import { apiClient } from '../api/axios';
import { Employee } from '../types/auth';

export async function fetchEmployees(): Promise<Employee[]> {
  const response = await apiClient.get<Employee[]>('/employees');
  return response.data;
}
