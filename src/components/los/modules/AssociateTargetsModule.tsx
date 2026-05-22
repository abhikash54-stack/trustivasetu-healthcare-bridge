'use client'

import { useState } from 'react'
import { useLos } from '../LosProvider'
import { btnPrimary, inputCls } from '../ui'

export function AssociateTargetsModule() {
  const { db, saveTarget } = useLos()
  const [form, setForm] = useState({
    associateName: '',
    month: new Date().toISOString().slice(0, 7),
    leadsTarget: 20,
    disbursalTarget: 50,
  })

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-lime-300">Associate Targets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
        <input className={inputCls} placeholder="Associate name" value={form.associateName} onChange={(e) => setForm({ ...form, associateName: e.target.value })} />
        <input className={inputCls} type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
        <input className={inputCls} type="number" placeholder="Leads target" value={form.leadsTarget} onChange={(e) => setForm({ ...form, leadsTarget: Number(e.target.value) })} />
        <input className={inputCls} type="number" placeholder="Disbursal (₹ Lakh)" value={form.disbursalTarget} onChange={(e) => setForm({ ...form, disbursalTarget: Number(e.target.value) })} />
        <button type="button" className={btnPrimary} onClick={() => saveTarget(form)}>Assign target</button>
      </div>
      <table className="w-full text-sm border border-white/10 rounded-xl">
        <thead className="bg-white/10">
          <tr>
            <th className="p-3 text-left">Associate</th>
            <th className="p-3 text-left">Month</th>
            <th className="p-3 text-left">Leads</th>
            <th className="p-3 text-left">Disbursal ₹L</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {db.targets.map((t) => (
            <tr key={t.id} className="border-t border-white/10">
              <td className="p-3">{t.associateName}</td>
              <td className="p-3">{t.month}</td>
              <td className="p-3">{t.achievedLeads}/{t.leadsTarget}</td>
              <td className="p-3">{t.disbursalTarget}</td>
              <td className="p-3">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
