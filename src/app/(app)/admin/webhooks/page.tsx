'use client'

import { useState, useEffect, useCallback } from 'react'

import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { formatDateTime, cn } from '@/lib/utils'

interface WebhookEvent {
  id: string
  event: string
  entity: string
  status: string
  error: string | null
  createdAt: string
  processedAt: string | null
}

export default function WebhookLogsPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [entity, setEntity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = new URLSearchParams({ page: String(page), pageSize: '25' })
      if (status) p.set('status', status)
      if (entity) p.set('entity', entity)
      const res = await fetch(`/api/webhooks/events?${p}`)
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setEvents(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [page, status, entity])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const statusColor: Record<string, string> = {
    RECEIVED: 'bg-gray-100 text-gray-700',
    PROCESSED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  }

  const pageCount = Math.ceil(total / 25)

  return (
    <div className="flex flex-col min-h-full">
      

      <div className="flex-1 p-4 sm:p-6 space-y-4">
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-800">
          <p className="font-medium">Integration endpoints</p>
          <p className="text-xs mt-1 text-brand-600 font-mono">POST /api/webhooks/leads · /clinics · /users</p>
          <p className="text-xs mt-1">Header: <code className="bg-white px-1 rounded">x-webhook-secret</code></p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="">All statuses</option>
            {['RECEIVED', 'PROCESSED', 'FAILED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={entity} onChange={e => { setEntity(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="">All entities</option>
            {['LEAD', 'CLINIC', 'USER'].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {error && <ErrorAlert message={error} onRetry={fetchEvents} />}
        {loading ? <PageLoader /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Time', 'Event', 'Entity', 'Status', 'Error'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-800">{e.event}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{e.entity}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColor[e.status])}>{e.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-red-600 max-w-xs truncate">{e.error ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {events.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No webhook events yet</p>}
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
