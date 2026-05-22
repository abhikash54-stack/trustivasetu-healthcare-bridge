import type { Lead, LeadStatus } from './types'

const TRANSITIONS: Partial<Record<LeadStatus, LeadStatus[]>> = {
  ENQUIRY_CREATED: ['OTP_VERIFIED', 'CANCELLED'],
  OTP_VERIFIED: ['KYC_PENDING', 'CANCELLED'],
  KYC_PENDING: ['KYC_COMPLETED', 'CANCELLED'],
  KYC_COMPLETED: ['BANKING_PENDING', 'CANCELLED'],
  BANKING_PENDING: ['CREDIT_REVIEW', 'CANCELLED'],
  CREDIT_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['SANCTIONED', 'REJECTED', 'CANCELLED'],
  SANCTIONED: ['DISBURSED', 'CANCELLED'],
  DISBURSED: ['CLOSED'],
  REJECTED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
}

export function canTransition(from: LeadStatus, to: LeadStatus): boolean {
  if (from === to) return true
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function transitionLead(
  lead: Lead,
  to: LeadStatus,
  by: string,
  note?: string
): Lead {
  if (!canTransition(lead.status, to)) {
    throw new Error(`Cannot move from ${lead.status} to ${to}`)
  }
  const at = new Date().toISOString()
  return {
    ...lead,
    status: to,
    updatedAt: at,
    auditLog: [
      ...lead.auditLog,
      { at, action: `STATUS_${to}`, by, note },
    ],
  }
}

export function lmsStatusFromLead(status: LeadStatus): string {
  if (status === 'APPROVED' || status === 'SANCTIONED') return 'APPROVED'
  if (status === 'DISBURSED' || status === 'CLOSED') return 'DISBURSED'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'REJECTED'
  return 'PENDING'
}

export function buildLosEnquiryId(mobile: string, patient: string): string {
  return `LOS-${mobile}-${patient.replace(/\s/g, '')}`
}
