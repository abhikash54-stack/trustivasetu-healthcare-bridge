'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useLos } from '../LosProvider'
import { LEAD_STATUSES, STATUS_LABELS } from '@/lib/los/constants'
import { StatusBadge, btnPrimary, inputCls, selectCls } from '../ui'
import type { LeadStatus } from '@/lib/los/types'

export function AllLeadsModule() {
  const { db, setLeadStatus, session } = useLos()
  const [hospital, setHospital] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    return db.leads.filter((l) => {
      if (hospital && l.hospitalName !== hospital) return false
      if (status && l.status !== status) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !l.applicantName.toLowerCase().includes(q) &&
          !l.id.toLowerCase().includes(q) &&
          !l.mobileNumber.includes(q)
        )
          return false
      }
      return true
    })
  }, [db.leads, hospital, status, search])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-lime-300">All Leads</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className={inputCls}
          placeholder="Search lead / patient / mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={selectCls} value={hospital} onChange={(e) => setHospital(e.target.value)}>
          <option value="">All hospitals</option>
          {db.hospitals.map((h) => (
            <option key={h.id} value={h.name} className="text-black">
              {h.name}
            </option>
          ))}
        </select>
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s} className="text-black">
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <span className="text-gray-400 text-sm self-center">{rows.length} leads</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3">Lead ID</th>
              <th className="p-3">Applicant</th>
              <th className="p-3">Estimate</th>
              <th className="p-3">Associate + Hospital</th>
              <th className="p-3">Eligibility</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3 font-mono text-xs">{l.id}</td>
                <td className="p-3">{l.applicantName}</td>
                <td className="p-3">₹{l.estimateAmount.toLocaleString()}</td>
                <td className="p-3">
                  <div>{l.associateName}</div>
                  <div className="text-gray-400 text-xs">{l.hospitalName}</div>
                </td>
                <td className="p-3">{l.eligibility}</td>
                <td className="p-3">
                  <StatusBadge status={l.status} />
                </td>
                <td className="p-3 space-x-2">
                  <Link href={`/partner/leads/${l.id}`} className="text-blue-400 underline">
                    Open
                  </Link>
                  <select
                    className="bg-white/10 text-xs rounded px-1 py-0.5"
                    value={l.status}
                    onChange={(e) =>
                      setLeadStatus(l.id, e.target.value as LeadStatus, session?.email ?? 'admin')
                    }
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s} className="text-black">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No leads yet — use Create Lead
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
