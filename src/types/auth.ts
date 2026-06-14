export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'TERMINATED';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'REGIONAL_MANAGER' | 'TEAM_MEMBER';

export type OccasionType = 'BIRTHDAY' | 'WORK_ANNIVERSARY' | 'MARRIAGE_ANNIVERSARY' | 'JOINING_DATE' | 'CUSTOM';

export interface CustomOccasion {
  id: string;
  name: string;
  date: string; // "MM-DD"
}

export interface OccasionMatch {
  type: OccasionType;
  label: string;
  emoji: string;
  message: string;
  yearsCount?: number;
  customName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
  // Special occasion fields (stored as "MM-DD" for recurrence)
  birthday?: string;          // "MM-DD"
  marriageAnniversary?: string; // "MM-DD"
  joiningDate?: string;       // ISO date string (to calculate work anniversary year)
  customOccasions?: CustomOccasion[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn?: number;
  user: UserProfile;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
  createdAt: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface Lender {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Target {
  id: string;
  year: number;
  month: number;
  leadsTarget: number;
  disbursalTarget: number;
  userId?: string;
  regionId?: string;
  clinicId?: string;
  user?: { id: string; name: string };
  region?: { id: string; name: string };
  clinic?: { id: string; name: string };
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string };
}

export interface MonthlyReport {
  period: string;
  month: string;
  totalLeads: number;
  approved: number;
  disbursed: number;
  leadValue: number;
  approvedValue: number;
  disbursedValue: number;
  approvalRate: number;
  disbursalRate: number;
}

export interface RegionReport {
  id: string;
  name: string;
  totalLeads: number;
  approved: number;
  disbursed: number;
  leadValue: number;
  disbursedValue: number;
  approvalRate: number;
}

export interface RMReport {
  id: string;
  name: string;
  role: string;
  totalLeads: number;
  approved: number;
  disbursed: number;
  leadValue: number;
  disbursedValue: number;
  approvalRate: number;
}

export interface LenderReport {
  id: string;
  name: string;
  code: string;
  totalLeads: number;
  approved: number;
  disbursed: number;
  approvedValue: number;
  disbursedValue: number;
  approvalRate: number;
  disbursalRate: number;
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
  description: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'HOLIDAY' | 'WEEKEND';
  workingHours: string | null;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInAddress?: string;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
}

export interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalLeave: number;
  totalWorkingDays: number;
  todayStatus: 'CHECKED_IN' | 'CHECKED_OUT' | 'NOT_MARKED';
  checkInTime: string | null;
  checkOutTime: string | null;
  lateMarks: number;
  halfDays: number;
  missedPunches: number;
  weeklyPresent: number;
  weeklyTotal: number;
  monthlyPresent: number;
  monthlyTotal: number;
  attendancePercentage: number;
  breakDuration: string | null;
  workingHours: string | null;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInAddress?: string;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutAddress?: string;
}

export interface LeaveQuota {
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveBalance {
  casual: LeaveQuota;
  sick: LeaveQuota;
  earned: LeaveQuota;
  unpaid: LeaveQuota;
}

export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Leave {
  id: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  approvedBy?: string;
  remarks?: string;
}

export interface LeaveApplication {
  type: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'LEAD' | 'TASK' | 'LEAVE' | 'APPROVAL' | 'SYSTEM' | 'CELEBRATION' | 'OCCASION';
  isRead: boolean;
  createdAt: string;
  referenceId?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type PolicyCategory = 'LEAVE' | 'CODE_OF_CONDUCT' | 'COMPENSATION' | 'SAFETY' | 'GENERAL';

export interface HRPolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  description: string;
  documentUrl?: string;
  effectiveDate: string;
  updatedAt: string;
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
  lenderId: string;
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
  assignedRMId: string;
  regionId: string;
  accountNumber: string;
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

export interface RecentLead {
  id: string;
  applicantName: string;
  status: string;
  amount: number;
  clinicName: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  approvedLeads: number;
  disbursedLeads: number;
  pendingLeads: number;
  rejectedLeads: number;
  approvedValue: string;
  disbursedValue: string;
  totalLeadValue: string;
  approvalRate: number;
  disbursalRate: number;
  activeClinics: number;
  topClinic: string;
  leadStatusCounts: DashboardMetricCounts;
  runRate: RunRate;
  trend: TrendSeries[];
  recentLeads: RecentLead[];
}
