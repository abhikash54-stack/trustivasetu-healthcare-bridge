'use client'

import { useState, useEffect, useCallback } from 'react'

import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { formatDateTime } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string | null
  details: string | null
  createdAt: string
  user: { name: string; email: string; role: string } | null
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = new URLSearchParams({ page: String(page), pageSize: '25' })
      if (entity) p.set('entity', entity)
      if (action) p.set('action', action)
      const res = await fetch(`/api/audit-logs?${p}`)
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setLogs(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [page, entity, action])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const pageCount = Math.ceil(total / 25)

  return (
    <div className="flex flex-col min-h-full">
      

      <div className="flex-1 p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <select value={entity} onChange={e => { setEntity(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="">All entities</option>
            {['User', 'Lead', 'Clinic', 'Target'].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={action} onChange={e => { setAction(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="">All actions</option>
            {['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'DEACTIVATE'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {error && <ErrorAlert message={error} onRetry={fetchLogs} />}
        {loading ? <PageLoader /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Time', 'User', 'Action', 'Entity', 'Details'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium text-gray-800">{l.user?.name ?? '—'}</p>
                      <p className="text-xs text-gray-500">{l.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-brand-700">{l.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{l.entity}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{l.details ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No logs found</p>}
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Prev</button>
            <span className="text-sm text-gray-600 py-1.5">Page {page} of {pageCount}</span>
            <button disabled={page >= pageCount} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
