import { apiClient } from '../api/axios';
import { Leave, LeaveBalance, LeaveApplication } from '../types/auth';

export async function fetchLeaveBalance(): Promise<LeaveBalance> {
  const response = await apiClient.get<LeaveBalance>('/leave/balance');
  return response.data;
}

export async function fetchLeaves(): Promise<Leave[]> {
  const response = await apiClient.get<Leave[]>('/leave');
  return response.data;
}

export async function applyLeave(application: LeaveApplication): Promise<Leave> {
  const response = await apiClient.post<Leave>('/leave', application);
  return response.data;
}

export async function cancelLeave(leaveId: string): Promise<void> {
  await apiClient.put(`/leave/${leaveId}/cancel`);
}
