export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'REGIONAL_MANAGER' | 'TEAM_MEMBER'
export type LeadStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CANCELLED'
export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'

export interface DashboardMetrics {
  totalLeads: number
  totalApproved: number
  totalDisbursed: number
  totalClinics: number
  totalLeadValue: number
  totalApprovedValue: number
  totalDisbursedValue: number
  approvalRate: number
  disbursalRate: number
  lenderWise: Array<{
    lenderId: string
    lenderName: string
    totalLeads: number
    approved: number
    approvalRate: number
  }>
  target: {
    leadsTarget: number
    disbursalTarget: number
    leadsAchieved: number
    disbursalAchieved: number
    leadsGrowth: number
    disbursalGrowth: number
    requiredLeadRunRate: number
    requiredDisbursalRunRate: number
    currentLeadRunRate: number
    currentDisbursalRunRate: number
  }
  monthlyTrend: Array<{
    month: string
    leads: number
    approved: number
    disbursed: number
    leadValue: number
    approvedValue: number
    disbursedValue: number
  }>
}

export interface ClinicWithStats {
  id: string
  name: string
  address: string
  accountNumber: string | null
  contactPerson: string
  contactNumber: string
  email: string | null
  businessPotential: number | null
  isActive: boolean
  onboardedAt: string
  region: { id: string; name: string }
  assignedRM: { id: string; name: string } | null
  totalLeads: number
  mtdLeads: number
  lmtdLeads: number
  totalDisbursalValue: number
  mtdDisbursalValue: number
  lmtdDisbursalValue: number
  leadsGrowth: number
  disbursalGrowth: number
}

export interface FilterOptions {
  dateFrom?: string
  dateTo?: string
  regionId?: string
  clinicId?: string
  lenderId?: string
  rmId?: string
  status?: string
  search?: string
}
