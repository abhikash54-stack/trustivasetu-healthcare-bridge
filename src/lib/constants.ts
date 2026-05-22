export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  REGIONAL_MANAGER: 'REGIONAL_MANAGER',
  TEAM_MEMBER: 'TEAM_MEMBER',
} as const

export const LEAD_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'CANCELLED'] as const

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN] as const

export const RM_ROLES = [ROLES.REGIONAL_MANAGER, ROLES.TEAM_MEMBER] as const

export const WEBHOOK_EVENTS = {
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  CLINIC_CREATED: 'clinic.created',
  CLINIC_UPDATED: 'clinic.updated',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
} as const
