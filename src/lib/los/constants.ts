import type { LeadStatus } from './types'

export const LEAD_STATUSES: LeadStatus[] = [
  'ENQUIRY_CREATED',
  'OTP_VERIFIED',
  'KYC_PENDING',
  'KYC_COMPLETED',
  'BANKING_PENDING',
  'CREDIT_REVIEW',
  'APPROVED',
  'REJECTED',
  'SANCTIONED',
  'DISBURSED',
  'CLOSED',
  'CANCELLED',
]

export const STATUS_LABELS: Record<LeadStatus, string> = {
  ENQUIRY_CREATED: 'Enquiry Created',
  OTP_VERIFIED: 'OTP Verified',
  KYC_PENDING: 'KYC Pending',
  KYC_COMPLETED: 'KYC Completed',
  BANKING_PENDING: 'Banking Pending',
  CREDIT_REVIEW: 'Credit Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SANCTIONED: 'Sanctioned',
  DISBURSED: 'Disbursed',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
}

export const SIDEBAR_ITEMS = [
  'User Administration',
  'Associate Targets',
  'Attendance',
  'All Leads',
  'Lead Allocation',
  'Active Cases',
  'Create Lead',
  'My Leads',
  'My Enquiries',
  'Visits',
  'Finance Estimator',
] as const

export const SIDEBAR_SECTIONS = [
  {
    title: 'OPERATIONS',
    items: [
      'Lender1 application',
      'Lender2 application',
      'Lender3 application',
      'Lender4 application',
      'Lender5 application',
      'User comments',
      'Enquiries',
      'Nach registrations',
    ],
  },
  {
    title: 'CREDIT',
    items: ['Credit deviations', 'Collections', 'Nach registrations', 'Tele collection'],
  },
  {
    title: 'FINANCE',
    items: ['Hospital payments', 'Collections'],
  },
] as const

export const CREATE_USER_OPTIONS = [
  'Relationship Associate',
  'Operations Desk',
  'Hospital Access',
  'Hospital',
  'Hospital Lifecycle',
  'Business Growth Team',
  'Hospital Team Directory',
] as const

export const EMI_PRODUCTS = [
  { code: '12/4', label: 'Product 12/4 (4 advance + 8 balance)', advance: 4, balance: 8 },
  { code: '3/0', label: 'Product 3/0 (0 advance + 3 balance)', advance: 0, balance: 3 },
  { code: '4/1', label: 'Product 4/1 (1 advance + 3 balance)', advance: 1, balance: 3 },
  { code: '9/3', label: 'Product 9/3 (3 advance + 6 balance)', advance: 3, balance: 6 },
] as const

export const ACTIVE_CASE_STATUSES: LeadStatus[] = [
  'KYC_PENDING',
  'KYC_COMPLETED',
  'BANKING_PENDING',
  'CREDIT_REVIEW',
  'APPROVED',
  'SANCTIONED',
]
