'use client'

import { useMemo, useState } from 'react'
import { useLos } from '../LosProvider'
import { btnPrimary, inputCls, selectCls } from '../ui'
import type { VisitStatus } from '@/lib/los/types'

export function VisitsModule() {
  const { db, createVisit, session, persist } = useLos()
  const [tab, setTab] = useState<'schedule' | 'timeline' | 'today'>('schedule')
  const [form, setForm] = useState({
    date: '',
    time: '10:00',
    hospitalName: '',
    visitedWith: '',
    reason: '',
  })
  const today = new Date().toISOString().split('T')[0]

  const todayVisits = useMemo(
    () => db.visits.filter((v) => v.date === today),
    [db.visits, today]
  )

  async function schedule() {
    if (!form.hospitalName || !form.date) return
    await createVisit({
      ...form,
      status: 'SCHEDULED',
      createdBy: session?.email ?? 'system',
    })
    setForm({ date: '', time: '10:00', hospitalName: '', visitedWith: '', reason: '' })
  }

  async function setStatus(id: string, status: VisitStatus) {
    const next = {
      ...db,
      visits: db.visits.map((v) => (v.id === id ? { ...v, status } : v)),
    }
    await persist(next)
  }

  const list =
    tab === 'today' ? todayVisits : db.visits

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-lime-300">Visits</h2>
      <div className="flex gap-2">
        {(['schedule', 'timeline', 'today'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg capitalize ${tab === t ? 'bg-lime-300 text-black' : 'bg-white/10'}`}
          >
            {t === 'today' ? "Today's Visits" : t}
          </button>
        ))}
      </div>

      {tab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input type="time" className={inputCls} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <select className={selectCls} value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}>
            <option value="">Hospital</option>
            {db.hospitals.map((h) => (
              <option key={h.id} value={h.name} className="text-black">{h.name}</option>
            ))}
          </select>
          <input className={inputCls} placeholder="Visited with" value={form.visitedWith} onChange={(e) => setForm({ ...form, visitedWith: e.target.value })} />
          <input className={inputCls} placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <button type="button" className={btnPrimary} onClick={schedule}>Schedule Visit</button>
        </div>
      )}

      <ul className="space-y-2">
        {list.map((v) => (
          <li key={v.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-wrap justify-between gap-2">
            <div>
              <p className="font-medium">{v.hospitalName}</p>
              <p className="text-xs text-gray-400">{v.date} {v.time} — {v.reason}</p>
              <p className="text-xs">With: {v.visitedWith}</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs bg-white/10 px-2 py-1 rounded">{v.status}</span>
              {v.status === 'SCHEDULED' && (
                <>
                  <button type="button" className="text-blue-400 text-xs" onClick={() => setStatus(v.id, 'IN_PROGRESS')}>Check-in</button>
                  <button type="button" className="text-lime-300 text-xs" onClick={() => setStatus(v.id, 'COMPLETED')}>Complete</button>
                  <button type="button" className="text-red-400 text-xs" onClick={() => setStatus(v.id, 'MISSED')}>Missed</button>
                </>
              )}
              {v.status === 'IN_PROGRESS' && (
                <button type="button" className="text-lime-300 text-xs" onClick={() => setStatus(v.id, 'COMPLETED')}>Submit</button>
              )}
            </div>
          </li>
        ))}
        {list.length === 0 && <p className="text-gray-400">No visits scheduled.</p>}
      </ul>
    </div>
  )
}
