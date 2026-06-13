import { apiClient } from '../api/axios';
import { Clinic, ClinicDetail } from '../types/auth';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function normalizeClinic(raw: any): Clinic {
  return {
    id: raw.id ?? '',
    name: raw.name ?? '',
    location: raw.address ?? '',
    services: [],
    status: raw.isActive ? 'ACTIVE' : 'INACTIVE',
  };
}

function normalizeClinicDetail(raw: any): ClinicDetail {
  const targets = Array.isArray(raw.targets) && raw.targets.length > 0 ? raw.targets[0] : null;
  return {
    ...normalizeClinic(raw),
    address: raw.address ?? '',
    contactPerson: raw.contactPerson ?? '',
    contactNumber: raw.contactNumber ?? '',
    email: raw.email ?? '',
    businessPotential: raw.businessPotential != null ? String(raw.businessPotential) : '',
    assignedRM: raw.assignedRM?.name ?? '',
    currentTargets: {
      month: targets?.month != null ? (MONTH_NAMES[(Number(targets.month) - 1) % 12] ?? '') : '',
      year: targets?.year ?? new Date().getFullYear(),
      leadsTarget: targets?.leadsTarget ?? 0,
      disbursalTarget: targets?.disbursalTarget != null ? String(targets.disbursalTarget) : '',
      achievedLeads: targets?.achievedLeads ?? 0,
      achievedDisbursal: targets?.achievedDisbursal != null ? String(targets.achievedDisbursal) : '',
    },
    recentLeads: [],
    notes: '',
  };
}

export async function fetchClinics(): Promise<Clinic[]> {
  const response = await (apiClient as any).get('/clinics');
  const raw: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
  return raw.map(normalizeClinic);
}

export async function fetchClinicById(clinicId: string): Promise<ClinicDetail> {
  const response = await (apiClient as any).get(`/clinics/${clinicId}`);
  const raw = response.data?.data ?? response.data;
  return normalizeClinicDetail(raw);
}
