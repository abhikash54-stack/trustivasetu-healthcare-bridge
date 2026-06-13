import { apiClient } from '../api/axios';
import { AttendanceRecord, AttendanceSummary } from '../types/auth';

export async function fetchAttendanceSummary(): Promise<AttendanceSummary> {
  const response = await apiClient.get<AttendanceSummary>('/attendance/summary');
  return response.data;
}

export async function fetchAttendanceHistory(month?: string): Promise<AttendanceRecord[]> {
  const params = month ? { month } : {};
  const response = await apiClient.get<AttendanceRecord[]>('/attendance/history', { params });
  return response.data;
}

export async function checkIn(): Promise<{ checkInTime: string }> {
  const response = await apiClient.post<{ checkInTime: string }>('/attendance/check-in');
  return response.data;
}

export async function checkOut(): Promise<{ checkOutTime: string; workingHours: string }> {
  const response = await apiClient.post<{ checkOutTime: string; workingHours: string }>('/attendance/check-out');
  return response.data;
}
