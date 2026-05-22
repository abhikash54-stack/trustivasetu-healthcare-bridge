'use client'

import Link from 'next/link'
import { formatDateTime, getStatusColor, cn } from '@/lib/utils'

interface ActivityData {
  recentLeads: Array<{
    id: string
    applicantName: string
    amount: number
    status: string
    createdAt: string
    clinic: { name: string }
    lender: { name: string } | null
  }>
  pendingCount: number
  recentAudit: Array<{
    id: string
    action: string
    entity: string
    entityId: string | null
    createdAt: string
    user: { name: string } | null
  }>
}

const emptyActivity: ActivityData = {
  recentLeads: [],
  pendingCount: 0,
  recentAudit: [],
}

export function RecentActivity({ data }: { data: ActivityData | null | undefined }) {
  const safe =
    data && Array.isArray(data.recentLeads) && Array.isArray(data.recentAudit)
      ? data
      : emptyActivity
  const recentLeads = safe.recentLeads ?? []
  const recentAudit = safe.recentAudit ?? []
  const pendingCount = safe.pendingCount ?? 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Recent Leads</h3>
          {pendingCount > 0 && (
            <Link href="/leads?status=PENDING"
              className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200">
              {pendingCount} pending
            </Link>
          )}
        </div>
        <ul className="space-y-3">
          {recentLeads.length === 0 ? (
            <li className="text-sm text-gray-400">No leads yet</li>
          ) : (
            recentLeads.map(l => (
              <li key={l.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{l.applicantName}</p>
                  <p className="text-xs text-gray-500 truncate">{l.clinic.name} · {l.lender?.name ?? 'No lender'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', getStatusColor(l.status))}>
                    {l.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(l.createdAt)}</p>
                </div>
              </li>
            ))
          )}
        </ul>
        <Link href="/leads" className="block text-center text-xs text-brand-600 font-medium mt-4 hover:underline">
          View all leads →
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <ul className="space-y-3">
          {recentAudit.length === 0 ? (
            <li className="text-sm text-gray-400">No activity logged</li>
          ) : (
            recentAudit.map(a => (
              <li key={a.id} className="flex gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                  {a.action.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-gray-800">
                    <span className="font-medium">{a.user?.name ?? 'System'}</span>
                    {' '}{a.action.toLowerCase()} {a.entity.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-400">{formatDateTime(a.createdAt)}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
