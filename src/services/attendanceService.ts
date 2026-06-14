import * as Location from 'expo-location';
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
  lateMarks: 0,
  halfDays: 0,
  missedPunches: 0,
  weeklyPresent: 0,
  weeklyTotal: 0,
  monthlyPresent: 0,
  monthlyTotal: 0,
  attendancePercentage: 0,
  breakDuration: null,
  workingHours: null,
};

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  address?: string;
}

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function getCurrentLocation(): Promise<GpsLocation | null> {
  try {
    const granted = await requestLocationPermission();
    if (!granted) return null;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    let address: string | undefined;
    try {
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geo) {
        const parts = [geo.name, geo.street, geo.district, geo.city, geo.region].filter(Boolean);
        address = parts.join(', ');
      }
    } catch { /* skip address on error */ }
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      address,
    };
  } catch {
    return null;
  }
}

export async function fetchAttendanceSummary(): Promise<AttendanceSummary> {
  try {
    const response = await apiClient.get<AttendanceSummary>('/attendance/summary');
    const raw: any = response.data ?? {};
    return {
      totalPresent: raw.totalPresent ?? 0,
      totalAbsent: raw.totalAbsent ?? 0,
      totalLeave: raw.totalLeave ?? 0,
      totalWorkingDays: raw.totalWorkingDays ?? 0,
      todayStatus: raw.todayStatus ?? 'NOT_MARKED',
      checkInTime: raw.checkInTime ?? null,
      checkOutTime: raw.checkOutTime ?? null,
      lateMarks: raw.lateMarks ?? 0,
      halfDays: raw.halfDays ?? 0,
      missedPunches: raw.missedPunches ?? 0,
      weeklyPresent: raw.weeklyPresent ?? 0,
      weeklyTotal: raw.weeklyTotal ?? 0,
      monthlyPresent: raw.monthlyPresent ?? raw.totalPresent ?? 0,
      monthlyTotal: raw.monthlyTotal ?? raw.totalWorkingDays ?? 0,
      attendancePercentage: raw.attendancePercentage ?? (raw.totalWorkingDays > 0 ? Math.round((raw.totalPresent / raw.totalWorkingDays) * 100) : 0),
      breakDuration: raw.breakDuration ?? null,
      workingHours: raw.workingHours ?? null,
      checkInLatitude: raw.checkInLatitude,
      checkInLongitude: raw.checkInLongitude,
      checkInAddress: raw.checkInAddress,
      checkOutLatitude: raw.checkOutLatitude,
      checkOutLongitude: raw.checkOutLongitude,
      checkOutAddress: raw.checkOutAddress,
    };
  } catch (error) {
    if (is404(error)) return NULL_SUMMARY;
    throw error;
  }
}

export async function fetchAttendanceHistory(params?: { month?: string; dateFrom?: string; dateTo?: string }): Promise<AttendanceRecord[]> {
  try {
    const p: any = {};
    if (params?.month) p.month = params.month;
    if (params?.dateFrom) p.dateFrom = params.dateFrom;
    if (params?.dateTo) p.dateTo = params.dateTo;
    const response = await apiClient.get<AttendanceRecord[]>('/attendance/history', { params: p });
    const raw = (response.data as any)?.data ?? response.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((r: any) => ({
      id: r.id ?? '',
      date: r.date ?? '',
      checkIn: r.checkIn ?? null,
      checkOut: r.checkOut ?? null,
      status: r.status ?? 'ABSENT',
      workingHours: r.workingHours ?? null,
      checkInLatitude: r.checkInLatitude,
      checkInLongitude: r.checkInLongitude,
      checkInAddress: r.checkInAddress,
      checkOutLatitude: r.checkOutLatitude,
      checkOutLongitude: r.checkOutLongitude,
    }));
  } catch (error) {
    if (is404(error)) return [];
    throw error;
  }
}

export async function checkIn(location?: GpsLocation | null): Promise<{ checkInTime: string }> {
  const body: any = { deviceTimestamp: new Date().toISOString() };
  if (location) {
    body.latitude = location.latitude;
    body.longitude = location.longitude;
    body.accuracy = location.accuracy;
    body.address = location.address;
  }
  const response = await apiClient.post<{ checkInTime: string }>('/attendance/check-in', body);
  return response.data;
}

export async function checkOut(location?: GpsLocation | null): Promise<{ checkOutTime: string; workingHours: string }> {
  const body: any = { deviceTimestamp: new Date().toISOString() };
  if (location) {
    body.latitude = location.latitude;
    body.longitude = location.longitude;
    body.accuracy = location.accuracy;
    body.address = location.address;
  }
  const response = await apiClient.post<{ checkOutTime: string; workingHours: string }>('/attendance/check-out', body);
  return response.data;
}
