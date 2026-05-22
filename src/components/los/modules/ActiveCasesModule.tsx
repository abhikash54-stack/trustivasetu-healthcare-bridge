'use client'

import Link from 'next/link'
import { useLos } from '../LosProvider'
import { ACTIVE_CASE_STATUSES } from '@/lib/los/constants'
import { StatusBadge } from '../ui'

export function ActiveCasesModule() {
  const { db } = useLos()
  const active = db.leads.filter((l) => ACTIVE_CASE_STATUSES.includes(l.status))

  const buckets = {
    New: active.filter((l) => l.status === 'KYC_PENDING'),
    'Under review': active.filter((l) => ['KYC_COMPLETED', 'BANKING_PENDING'].includes(l.status)),
    'Credit review': active.filter((l) => l.status === 'CREDIT_REVIEW'),
    Approved: active.filter((l) => ['APPROVED', 'SANCTIONED'].includes(l.status)),
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-lime-300">Active Cases</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(buckets).map(([name, items]) => (
          <div key={name} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-gray-400">{name}</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </div>
        ))}
      </div>
      <ul className="space-y-2">
        {active.map((l) => {
          const hours = (Date.now() - new Date(l.updatedAt).getTime()) / 3600000
          return (
            <li key={l.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
              <div>
                <Link href={`/partner/leads/${l.id}`} className="text-blue-400 font-medium">
                  {l.applicantName}
                </Link>
                <p className="text-xs text-gray-400">TAT: {Math.round(hours)}h</p>
              </div>
              <StatusBadge status={l.status} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
