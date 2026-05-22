'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Region { id: string; name: string }
interface RM { id: string; name: string }

interface ClinicFormData {
  name: string; address: string; accountNumber: string; contactPerson: string
  contactNumber: string; email: string; businessPotential: string
  regionId: string; assignedRMId: string
}

interface Props {
  initial?: Partial<ClinicFormData & { id: string }>
  onSuccess: () => void
  onCancel: () => void
}

export function ClinicForm({ initial, onSuccess, onCancel }: Props) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState<ClinicFormData>({
    name: initial?.name ?? '', address: initial?.address ?? '',
    accountNumber: initial?.accountNumber ?? '', contactPerson: initial?.contactPerson ?? '',
    contactNumber: initial?.contactNumber ?? '', email: initial?.email ?? '',
    businessPotential: initial?.businessPotential ?? '', regionId: initial?.regionId ?? '',
    assignedRMId: initial?.assignedRMId ?? '',
  })
  const [regions, setRegions] = useState<Region[]>([])
  const [rms, setRms] = useState<RM[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/regions').then(r => r.json()),
      fetch('/api/users?role=REGIONAL_MANAGER&minimal=1').then(r => r.json()),
    ]).then(([r, u]) => { setRegions(r.data ?? []); setRms(u.data ?? []) })
  }, [])

  function update(k: keyof ClinicFormData, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        businessPotential: form.businessPotential ? parseFloat(form.businessPotential) : undefined,
        assignedRMId: form.assignedRMId || undefined,
      }
      const url = isEdit ? `/api/clinics/${initial!.id}` : '/api/clinics'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Failed') }
      toast.success(isEdit ? 'Clinic updated' : 'Clinic created')
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
        <Field label="Clinic Name *" value={form.name} onChange={v => update('name', v)} required />
        <Field label="Contact Person *" value={form.contactPerson} onChange={v => update('contactPerson', v)} required />
        <div className="col-span-2">
          <Field label="Address *" value={form.address} onChange={v => update('address', v)} required />
        </div>
        <Field label="Contact Number *" value={form.contactNumber} onChange={v => update('contactNumber', v)} required />
        <Field label="Email" value={form.email} onChange={v => update('email', v)} type="email" />
        <Field label="Account Number" value={form.accountNumber} onChange={v => update('accountNumber', v)} />
        <Field label="Business Potential (₹L)" value={form.businessPotential} onChange={v => update('businessPotential', v)} type="number" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
          <select value={form.regionId} onChange={e => update('regionId', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="">Select Region</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned RM</label>
          <select value={form.assignedRMId} onChange={e => update('assignedRMId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="">Not Assigned</option>
            {rms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
          {loading ? 'Saving...' : isEdit ? 'Update Clinic' : 'Add Clinic'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}

function Field({ label, value, onChange, required, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
    </div>
  )
}
