import { apiClient } from '../api/axios';
import { DashboardMetrics } from '../types/auth';

const fallbackDashboard: DashboardMetrics = {
  totalLeads: 82,
  approvedLeads: 34,
  disbursedLeads: 21,
  pendingLeads: 18,
  approvedValue: '₹12.4M',
  disbursedValue: '₹8.7M',
  activeClinics: 19,
  topClinic: 'Vertex Care Clinic',
  leadStatusCounts: {
    PENDING: 18,
    APPROVED: 34,
    DISBURSED: 21,
    REJECTED: 6,
    CANCELLED: 3,
  },
  runRate: {
    target: '₹30M',
    achieved: '₹18.2M',
    percentage: 61,
  },
  trend: [
    { month: 'Jan', value: 82 },
    { month: 'Feb', value: 94 },
    { month: 'Mar', value: 76 },
    { month: 'Apr', value: 115 },
    { month: 'May', value: 101 },
    { month: 'Jun', value: 83 },
  ],
};

export async function fetchDashboard(): Promise<DashboardMetrics> {
  try {
    const response = await apiClient.get('/dashboard');
    return response.data as DashboardMetrics;
  } catch (error) {
    return fallbackDashboard;
  }
}
