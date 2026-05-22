import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfMonth, endOfMonth, subMonths, getDaysInMonth, getDate } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLakhs(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `₹${value.toFixed(2)}L`
}

export function formatCrores(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const crores = value / 100
  return `₹${crores.toFixed(2)}Cr`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy, HH:mm')
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function getGrowthColor(value: number): string {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-gray-500'
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    DISBURSED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-blue-100 text-blue-800',
    REGIONAL_MANAGER: 'bg-teal-100 text-teal-800',
    TEAM_MEMBER: 'bg-gray-100 text-gray-800',
  }
  return map[role] ?? 'bg-gray-100 text-gray-800'
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    REGIONAL_MANAGER: 'Regional Manager',
    TEAM_MEMBER: 'Team Member',
  }
  return map[role] ?? role
}

export function getCurrentMonthRange() {
  const now = new Date()
  return { start: startOfMonth(now), end: endOfMonth(now) }
}

export function getPreviousMonthRange() {
  const prev = subMonths(new Date(), 1)
  return { start: startOfMonth(prev), end: endOfMonth(prev) }
}

export function calcRunRate(achieved: number, target: number) {
  const now = new Date()
  const daysElapsed = getDate(now)
  const totalDays = getDaysInMonth(now)
  const remaining = totalDays - daysElapsed

  const current = daysElapsed > 0 ? (achieved / daysElapsed) * totalDays : 0
  const required = remaining > 0 ? (target - achieved) / remaining : 0

  return { current: Math.round(current * 100) / 100, required: Math.max(0, Math.round(required * 100) / 100) }
}

export function generateMonthOptions(count = 12): Array<{ value: string; label: string }> {
  return Array.from({ length: count }, (_, i) => {
    const date = subMonths(new Date(), i)
    return { value: format(date, 'yyyy-MM'), label: format(date, 'MMMM yyyy') }
  })
}

export function parseMonthParam(param: string | null): { year: number; month: number } {
  if (!param) {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  }
  const [year, month] = param.split('-').map(Number)
  return { year, month }
}
