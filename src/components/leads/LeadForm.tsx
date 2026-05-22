'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Lead {
  id?: string; applicantName: string; phone?: string; email?: string
  amount: string; clinicId: string; lenderId?: string
  status?: string; approvedAmount?: string; disbursedAmount?: string
  applicationDate?: string; approvalDate?: string; disbursalDate?: string; remarks?: string
}

interface Props {
  initial?: Partial<Lead>
  onSuccess: () => void
  onCancel: () => void
}

export function LeadForm({ initial, onSuccess, onCancel }: Props) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState<Lead>({
    applicantName: initial?.applicantName ?? '',
    phone: initial?.phone ?? '', email: initial?.email ?? '',
    amount: initial?.amount ? String(initial.amount) : '',
    clinicId: initial?.clinicId ?? '', lenderId: initial?.lenderId ?? '',
    status: initial?.status ?? 'PENDING',
    approvedAmount: initial?.approvedAmount ? String(initial.approvedAmount) : '',
    disbursedAmount: initial?.disbursedAmount ? String(initial.disbursedAmount) : '',
    applicationDate: initial?.applicationDate ? format(new Date(initial.applicationDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    approvalDate: initial?.approvalDate ? format(new Date(initial.approvalDate), 'yyyy-MM-dd') : '',
    disbursalDate: initial?.disbursalDate ? format(new Date(initial.disbursalDate), 'yyyy-MM-dd') : '',
    remarks: initial?.remarks ?? '',
  })
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([])
  const [lenders, setLenders] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/clinics?minimal=1').then(r => r.json()),
      fetch('/api/lenders').then(r => r.json()),
    ]).then(([c, l]) => { setClinics(c.data ?? []); setLenders(l.data ?? []) })
  }, [])

  function upd(k: keyof Lead, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        approvedAmount: form.approvedAmount ? parseFloat(form.approvedAmount) : undefined,
        disbursedAmount: form.disbursedAmount ? parseFloat(form.disbursedAmount) : undefined,
        lenderId: form.lenderId || undefined,
        approvalDate: form.approvalDate || undefined,
        disbursalDate: form.disbursalDate || undefined,
      }
      const url = isEdit ? `/api/leads/${initial!.id}` : '/api/leads'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Failed') }
      toast.success(isEdit ? 'Lead updated' : 'Lead created')
      onSuccess()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Name *</label>
          <input type="text" value={form.applicantName} onChange={e => upd('applicantName', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => upd('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹L) *</label>
          <input type="number" step="0.01" value={form.amount} onChange={e => upd('amount', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application Date *</label>
          <input type="date" value={form.applicationDate} onChange={e => upd('applicationDate', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clinic *</label>
          <select value={form.clinicId} onChange={e => upd('clinicId', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="">Select Clinic</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lender</label>
          <select value={form.lenderId} onChange={e => upd('lenderId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="">Select Lender</option>
            {lenders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        {isEdit && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => upd('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                {['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount (₹L)</label>
              <input type="number" step="0.01" value={form.approvedAmount} onChange={e => upd('approvedAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disbursed Amount (₹L)</label>
              <input type="number" step="0.01" value={form.disbursedAmount} onChange={e => upd('disbursedAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Date</label>
              <input type="date" value={form.approvalDate} onChange={e => upd('approvalDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disbursal Date</label>
              <input type="date" value={form.disbursalDate} onChange={e => upd('disbursalDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </>
        )}

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea value={form.remarks} onChange={e => upd('remarks', e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
          {loading ? 'Saving...' : isEdit ? 'Update Lead' : 'Add Lead'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
