'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import toast from 'react-hot-toast'

interface Target {
  id: string
  year: number
  month: number
  leadsTarget: number
  disbursalTarget: number
  region: { id: string; name: string } | null
  user: { id: string; name: string } | null
  clinic: { id: string; name: string } | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminTargetsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [targets, setTargets] = useState<Target[]>([])
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ regionId: '', leadsTarget: '50', disbursalTarget: '200' })
  const [saving, setSaving] = useState(false)

  const fetchTargets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/targets?year=${year}&month=${month}`)
      if (!res.ok) throw new Error('Failed to load targets')
      const json = await res.json()
      setTargets(json.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetch('/api/regions').then(r => r.json()).then(d => setRegions(d.data ?? []))
  }, [])

  useEffect(() => { fetchTargets() }, [fetchTargets])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month,
          regionId: form.regionId || undefined,
          leadsTarget: parseInt(form.leadsTarget),
          disbursalTarget: parseFloat(form.disbursalTarget),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      toast.success('Target saved')
      fetchTargets()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this target?')) return
    const res = await fetch(`/api/targets/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); fetchTargets() }
    else toast.error('Delete failed')
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Monthly Targets" subtitle="Set lead and disbursal goals by region" />

      <div className="flex-1 p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Year</label>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
              {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Month</label>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-gray-600">Region (optional = company-wide)</label>
            <select value={form.regionId} onChange={e => setForm(f => ({ ...f, regionId: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
              <option value="">Company-wide</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-28">
            <label className="text-xs font-medium text-gray-600">Leads target</label>
            <input type="number" min={0} value={form.leadsTarget} onChange={e => setForm(f => ({ ...f, leadsTarget: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg" required />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-xs font-medium text-gray-600">Disbursal (₹L)</label>
            <input type="number" min={0} step={0.1} value={form.disbursalTarget} onChange={e => setForm(f => ({ ...f, disbursalTarget: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg" required />
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Target'}
          </button>
        </form>

        {error && <ErrorAlert message={error} onRetry={fetchTargets} />}
        {loading ? <PageLoader /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Scope', 'Leads Target', 'Disbursal Target (₹L)', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {targets.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {t.region?.name ?? t.clinic?.name ?? t.user?.name ?? 'Company-wide'}
                    </td>
                    <td className="px-4 py-3 text-sm">{t.leadsTarget}</td>
                    <td className="px-4 py-3 text-sm">{t.disbursalTarget}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {targets.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No targets for this month</p>}
          </div>
        )}
      </div>
    </div>
  )
}
