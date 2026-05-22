'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import toast from 'react-hot-toast'

interface Lender {
  id: string
  name: string
  code: string
  isActive: boolean
}

export default function AdminLendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchLenders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/lenders')
      if (!res.ok) throw new Error('Failed to load lenders')
      const json = await res.json()
      setLenders(json.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLenders() }, [fetchLenders])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/lenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code: code.toUpperCase() }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? 'Failed to create lender')
      }
      toast.success('Lender created')
      setName('')
      setCode('')
      fetchLenders()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Lenders" subtitle="Manage lending partners for approval tracking" />

      <div className="flex-1 p-4 sm:p-6 space-y-5">
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-600">Lender name</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-xs font-medium text-gray-600">Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} required maxLength={10}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:outline-none uppercase" />
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">
            {saving ? 'Adding...' : 'Add Lender'}
          </button>
        </form>

        {error && <ErrorAlert message={error} onRetry={fetchLenders} />}
        {loading ? <PageLoader /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Code', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lenders.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{l.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.code}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {l.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lenders.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No lenders yet</p>}
          </div>
        )}
      </div>
    </div>
  )
}
