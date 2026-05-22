'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { LeadTable } from '@/components/leads/LeadTable'
import { LeadForm } from '@/components/leads/LeadForm'
import { hasPermission } from '@/lib/permissions'
import toast from 'react-hot-toast'

const STATUSES = ['', 'PENDING', 'APPROVED', 'DISBURSED', 'REJECTED', 'CANCELLED']

export function LeadsPageContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [leads, setLeads] = useState<unknown[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editLead, setEditLead] = useState<unknown>(null)

  const canCreate = session?.user && hasPermission(session.user.role, 'LEAD_CREATE')
  const canEdit = session?.user && hasPermission(session.user.role, 'LEAD_UPDATE')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), pageSize: '20' })
    if (search) p.set('search', search)
    if (status) p.set('status', status)
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    const res = await fetch(`/api/leads?${p}`)
    const data = await res.json()
    setLeads(data.data ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search, status, dateFrom, dateTo])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function handleStatusUpdate(lead: { id: string; amount: number; approvedAmount: number | null }, newStatus: string) {
    const extraFields: Record<string, unknown> = {}
    if (newStatus === 'APPROVED') {
      extraFields.approvedAmount = lead.amount * 0.85
      extraFields.approvalDate = new Date().toISOString().split('T')[0]
    }
    if (newStatus === 'DISBURSED') {
      extraFields.disbursedAmount = (lead.approvedAmount ?? lead.amount) * 0.95
      extraFields.disbursalDate = new Date().toISOString().split('T')[0]
    }
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, ...extraFields }),
    })
    if (res.ok) { toast.success(`Lead ${newStatus.toLowerCase()}`); fetchLeads() }
    else toast.error('Update failed')
  }

  async function handleExport() {
    const p = new URLSearchParams({ type: 'leads' })
    if (status) p.set('status', status)
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    const res = await fetch(`/api/export?${p}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.xlsx`
    a.click(); URL.revokeObjectURL(url)
  }

  const pageCount = Math.ceil(total / 20)

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Lead Management" subtitle={`${total} total leads`} />

      <div className="flex-1 p-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Search</label>
              <input type="text" placeholder="Applicant name..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 w-48" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Status</label>
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
                {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            {canCreate && (
              <button onClick={() => { setEditLead(null); setShowForm(true) }}
                className="ml-auto px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Lead
              </button>
            )}
            <button onClick={handleExport}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <LeadForm
                initial={editLead as Parameters<typeof LeadForm>[0]['initial']}
                onSuccess={() => { setShowForm(false); fetchLeads() }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : (
          <LeadTable
            leads={leads as Parameters<typeof LeadTable>[0]['leads']}
            onEdit={canEdit ? (l) => { setEditLead(l); setShowForm(true) } : undefined}
            onStatusUpdate={canEdit ? (handleStatusUpdate as unknown as Parameters<typeof LeadTable>[0]['onStatusUpdate']) : undefined}
            canEdit={!!canEdit}
          />
        )}

        {pageCount > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <span className="text-sm text-gray-600">Page {page} of {pageCount}</span>
            <button disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
