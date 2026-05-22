'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { formatDate, formatLakhs, formatPercent, getGrowthColor, cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [leads, setLeads] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/clinics/${id}`).then(r => r.json()),
      fetch(`/api/leads?clinicId=${id}&pageSize=10`).then(r => r.json()),
    ]).then(([c, l]) => {
      setData(c.data)
      setLeads(l.data ?? [])
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Clinic Details" />
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>
      </div>
    )
  }
  if (!data) return <div className="p-6 text-red-600">Clinic not found</div>

  const clinic = data as Record<string, unknown>

  return (
    <div className="flex flex-col min-h-full">
      <Header title={clinic.name as string} subtitle="Clinic / Centre Details" />

      <div className="flex-1 p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/clinics" className="hover:text-brand-600">Clinics</Link>
          <span>/</span>
          <span className="text-gray-800">{clinic.name as string}</span>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Clinic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem label="Address" value={clinic.address as string} />
              <InfoItem label="Contact Person" value={clinic.contactPerson as string} />
              <InfoItem label="Contact Number" value={clinic.contactNumber as string} />
              <InfoItem label="Email" value={(clinic.email as string) ?? '—'} />
              <InfoItem label="Account Number" value={(clinic.accountNumber as string) ?? '—'} />
              <InfoItem label="Business Potential" value={formatLakhs(clinic.businessPotential as number)} />
              <InfoItem label="Region" value={(clinic.region as Record<string, string>)?.name ?? '—'} />
              <InfoItem label="Assigned RM" value={(clinic.assignedRM as Record<string, string>)?.name ?? 'Not Assigned'} />
              <InfoItem label="Onboarded" value={formatDate(clinic.onboardedAt as string)} />
              <InfoItem label="Status" value={clinic.isActive ? 'Active' : 'Inactive'} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">This Month's Target</h3>
            {Array.isArray(clinic.targets) && (clinic.targets as unknown[]).length > 0 ? (
              <div className="space-y-3">
                {(clinic.targets as Array<Record<string, unknown>>).map(t => (
                  <div key={t.id as string}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Leads Target</span>
                      <span className="font-semibold">{t.leadsTarget as number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Disbursal Target</span>
                      <span className="font-semibold">{formatLakhs(t.disbursalTarget as number)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No target set</p>}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Recent Leads</h3>
            <Link href={`/leads?clinicId=${id}`} className="text-xs text-brand-600 hover:text-brand-800 font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Applicant', 'Amount', 'Status', 'Lender', 'Applied On'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(leads as Array<Record<string, unknown>>).map(l => (
                  <tr key={l.id as string} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{l.applicantName as string}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{formatLakhs(l.amount as number)}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusBadge(l.status as string))}>
                        {l.status as string}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{(l.lender as Record<string, string>)?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500">{formatDate(l.applicationDate as string)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <p className="text-center text-sm text-gray-400 py-6">No leads yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    DISBURSED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}
