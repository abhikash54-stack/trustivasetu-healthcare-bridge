'use client'
import { Header } from '@/components/layout/Header'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { formatDate, formatLakhs, getStatusColor, cn } from '@/lib/utils'

interface LeadDetail {
  id: string
  externalId: string | null
  applicantName: string
  phone: string | null
  email: string | null
  amount: number
  status: string
  approvedAmount: number | null
  disbursedAmount: number | null
  applicationDate: string
  approvalDate: string | null
  disbursalDate: string | null
  remarks: string | null
  clinic: { name: string; address: string; region: { name: string } }
  lender: { name: string } | null
  createdBy: { name: string } | null
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/leads/${params.id}`)
      .then(async res => {
        if (!res.ok) throw new Error('Lead not found')
        const json = await res.json()
        setLead(json.data)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Lead Details" subtitle={lead?.applicantName} />

      <div className="flex-1 p-4 sm:p-6">
        <button type="button" onClick={() => router.back()}
          className="text-sm text-brand-600 hover:text-brand-800 font-medium mb-4 flex items-center gap-1">
          ← Back to leads
        </button>

        {error && <ErrorAlert message={error} />}
        {loading ? <PageLoader /> : lead && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{lead.applicantName}</h2>
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(lead.status))}>
                  {lead.status}
                </span>
              </div>
              {lead.externalId && <p className="text-xs text-gray-500">External ID: {lead.externalId}</p>}
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{lead.phone ?? '—'}</dd></div>
                <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{lead.email ?? '—'}</dd></div>
                <div><dt className="text-gray-500">Applied</dt><dd className="font-medium">{formatLakhs(lead.amount)}</dd></div>
                <div><dt className="text-gray-500">Lender</dt><dd className="font-medium">{lead.lender?.name ?? '—'}</dd></div>
                <div><dt className="text-gray-500">Approved</dt><dd className="font-medium text-blue-700">{formatLakhs(lead.approvedAmount)}</dd></div>
                <div><dt className="text-gray-500">Disbursed</dt><dd className="font-medium text-green-700">{formatLakhs(lead.disbursedAmount)}</dd></div>
                <div><dt className="text-gray-500">Application</dt><dd>{formatDate(lead.applicationDate)}</dd></div>
                <div><dt className="text-gray-500">Created by</dt><dd>{lead.createdBy?.name ?? '—'}</dd></div>
              </dl>
              {lead.remarks && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Remarks</p>
                  <p className="text-sm text-gray-700">{lead.remarks}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Clinic</h3>
              <p className="font-medium text-gray-900">{lead.clinic.name}</p>
              <p className="text-sm text-gray-500 mt-1">{lead.clinic.region.name}</p>
              <p className="text-sm text-gray-600 mt-2">{lead.clinic.address}</p>
              <Link href="/clinics" className="inline-block mt-4 text-sm text-brand-600 font-medium hover:underline">
                View clinics →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
