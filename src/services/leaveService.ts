import { apiClient } from '../api/axios';
import { Leave, LeaveBalance, LeaveApplication } from '../types/auth';

function is404(error: any): boolean {
  return error?.response?.status === 404;
}

const NULL_BALANCE: LeaveBalance = {
  casual:  { total: 0, used: 0, remaining: 0 },
  sick:    { total: 0, used: 0, remaining: 0 },
  earned:  { total: 0, used: 0, remaining: 0 },
  unpaid:  { total: 0, used: 0, remaining: 0 },
};

export async function fetchLeaveBalance(): Promise<LeaveBalance> {
  try {
    const response = await apiClient.get<LeaveBalance>('/leave/balance');
    return response.data ?? NULL_BALANCE;
  } catch (error) {
    if (is404(error)) return NULL_BALANCE;
    throw error;
  }
}

export async function fetchLeaves(): Promise<Leave[]> {
  try {
    const response = await apiClient.get<Leave[]>('/leave');
    const raw = (response.data as any)?.data ?? response.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    if (is404(error)) return [];
    throw error;
  }
}

export async function applyLeave(application: LeaveApplication): Promise<Leave> {
  const response = await apiClient.post<Leave>('/leave', application);
  return response.data;
}

export async function cancelLeave(leaveId: string): Promise<void> {
  await apiClient.put(`/leave/${leaveId}/cancel`);
}
