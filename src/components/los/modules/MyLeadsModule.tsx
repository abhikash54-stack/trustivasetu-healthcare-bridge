'use client'

import Link from 'next/link'
import { useLos } from '../LosProvider'
import { StatusBadge } from '../ui'

export function MyLeadsModule() {
  const { db, session } = useLos()
  const email = session?.email ?? ''
  const mine = db.leads.filter(
    (l) => l.associateName === email || l.assignedTo === email
  )
  const approved = mine.filter((l) => l.status === 'APPROVED' || l.status === 'SANCTIONED').length
  const disbursed = mine.filter((l) => l.status === 'DISBURSED').length

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-lime-300">My Leads</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-gray-400 text-xs">Total</p>
          <p className="text-2xl font-bold">{mine.length}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-gray-400 text-xs">Approved</p>
          <p className="text-2xl font-bold">{approved}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-gray-400 text-xs">Disbursed</p>
          <p className="text-2xl font-bold">{disbursed}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-gray-400 text-xs">Approval ratio</p>
          <p className="text-2xl font-bold">
            {mine.length ? Math.round((approved / mine.length) * 100) : 0}%
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {mine.map((l) => (
          <li
            key={l.id}
            className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10"
          >
            <div>
              <p className="font-medium">{l.applicantName}</p>
              <p className="text-xs text-gray-400">{l.hospitalName}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={l.status} />
              <Link href={`/partner/leads/${l.id}`} className="text-blue-400 text-sm">
                View
              </Link>
            </div>
          </li>
        ))}
        {mine.length === 0 && (
          <p className="text-gray-400">No leads assigned to you yet.</p>
        )}
      </ul>
    </div>
  )
}
