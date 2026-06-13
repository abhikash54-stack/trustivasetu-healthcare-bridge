import { apiClient } from '../api/axios';
import { AttendanceRecord, AttendanceSummary } from '../types/auth';

function is404(error: any): boolean {
  return error?.response?.status === 404;
}

const NULL_SUMMARY: AttendanceSummary = {
  totalPresent: 0,
  totalAbsent: 0,
  totalLeave: 0,
  totalWorkingDays: 0,
  todayStatus: 'NOT_MARKED',
  checkInTime: null,
  checkOutTime: null,
};

export async function fetchAttendanceSummary(): Promise<AttendanceSummary> {
  try {
    const response = await apiClient.get<AttendanceSummary>('/attendance/summary');
    return response.data ?? NULL_SUMMARY;
  } catch (error) {
    if (is404(error)) return NULL_SUMMARY;
    throw error;
  }
}

export async function fetchAttendanceHistory(month?: string): Promise<AttendanceRecord[]> {
  try {
    const params = month ? { month } : {};
    const response = await apiClient.get<AttendanceRecord[]>('/attendance/history', { params });
    const raw = (response.data as any)?.data ?? response.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    if (is404(error)) return [];
    throw error;
  }
}

export async function checkIn(): Promise<{ checkInTime: string }> {
  const response = await apiClient.post<{ checkInTime: string }>('/attendance/check-in');
  return response.data;
}

export async function checkOut(): Promise<{ checkOutTime: string; workingHours: string }> {
  const response = await apiClient.post<{ checkOutTime: string; workingHours: string }>('/attendance/check-out');
  return response.data;
}
