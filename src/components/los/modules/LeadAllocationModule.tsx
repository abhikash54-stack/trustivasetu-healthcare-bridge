'use client'

import { useLos } from '../LosProvider'
import { btnPrimary, selectCls } from '../ui'

export function LeadAllocationModule() {
  const { db, allocateLead, persist } = useLos()
  const unassigned = db.leads.filter((l) => l.allocationStatus === 'UNASSIGNED')
  const assignees = db.users.length
    ? db.users.map((u) => u.email)
    : ['rm.south@trustivasetu.com', 'admin@trustivasetu.com']

  async function bulkAssign(email: string) {
    let next = { ...db }
    for (const l of unassigned) {
      next = {
        ...next,
        leads: next.leads.map((x) =>
          x.id === l.id
            ? {
                ...x,
                assignedTo: email,
                allocationStatus: 'ASSIGNED' as const,
              }
            : x
        ),
      }
    }
    await persist(next)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-lime-300">Lead Allocation</h2>
      <p className="text-gray-400 text-sm">{unassigned.length} unassigned leads</p>
      <div className="flex gap-3 items-center">
        <select id="bulk-assign" className={selectCls} defaultValue="">
          <option value="">Select assignee</option>
          {assignees.map((e) => (
            <option key={e} value={e} className="text-black">{e}</option>
          ))}
        </select>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => {
            const el = document.getElementById('bulk-assign') as HTMLSelectElement
            if (el?.value) bulkAssign(el.value)
          }}
        >
          Bulk assign all
        </button>
      </div>
      <ul className="space-y-2">
        {db.leads.map((l) => (
          <li key={l.id} className="flex justify-between bg-white/5 p-3 rounded-lg border border-white/10">
            <span>{l.id} — {l.applicantName}</span>
            <select
              className="bg-white/10 text-sm rounded px-2"
              value={l.assignedTo ?? ''}
              onChange={(e) => allocateLead(l.id, e.target.value)}
            >
              <option value="">Unassigned</option>
              {assignees.map((e) => (
                <option key={e} value={e} className="text-black">{e}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  )
}
