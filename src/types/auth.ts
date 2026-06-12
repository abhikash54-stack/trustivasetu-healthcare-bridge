export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Lead {
  id: string;
  applicantName: string;
  clinicName: string;
  source: string;
  status: string;
  assignedTo: string;
  updatedAt: string;
  amount: string;
}

export interface Enquiry {
  id: string;
  title: string;
  status: string;
  patientName: string;
  requestedAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  location: string;
  services: string[];
  status?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  progress: number;
}

export interface Agreement {
  id: string;
  title: string;
  counterparty: string;
  status: string;
}

export interface LeadDetail extends Lead {
  phone: string;
  email: string;
  approvedAmount: string;
  disbursedAmount: string;
  applicationDate: string;
  approvalDate: string;
  disbursalDate: string;
  remarks: string;
  lenderName: string;
  stage: string;
  statusHistory: { status: string; updatedAt: string; note?: string }[];
}

export interface ClinicDetail extends Clinic {
  address: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  businessPotential: string;
  assignedRM: string;
  currentTargets: {
    month: string;
    year: number;
    leadsTarget: number;
    disbursalTarget: string;
    achievedLeads: number;
    achievedDisbursal: string;
  };
  recentLeads: Lead[];
  notes: string;
}

export interface EnquiryDetail extends Enquiry {
  clinicName: string;
  enquiryType: string;
  hospitalName: string;
  mobileNumber: string;
  treatmentName: string;
  financingRequired: string;
  remarks: string;
  referenceId: string;
}

export interface DashboardMetricCounts {
  PENDING: number;
  APPROVED: number;
  DISBURSED: number;
  REJECTED: number;
  CANCELLED: number;
}

export interface RunRate {
  target: string;
  achieved: string;
  percentage: number;
}

export interface TrendSeries {
  month: string;
  value: number;
}

export interface DashboardMetrics {
  totalLeads: number;
  approvedLeads: number;
  disbursedLeads: number;
  pendingLeads: number;
  approvedValue: string;
  disbursedValue: string;
  activeClinics: number;
  topClinic: string;
  leadStatusCounts: DashboardMetricCounts;
  runRate: RunRate;
  trend: TrendSeries[];
}
