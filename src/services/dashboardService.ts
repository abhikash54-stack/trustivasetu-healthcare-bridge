import { apiClient } from '../api/axios';
import { DashboardMetrics } from '../types/auth';

export async function fetchDashboard(): Promise<DashboardMetrics> {
  const response = await apiClient.get('/dashboard');
  return response.data as DashboardMetrics;
}
