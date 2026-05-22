'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { formatLakhs } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ReportType = 'monthly' | 'region' | 'rm' | 'lender'

export default function ReportsPage() {
  const [type, setType] = useState<ReportType>('monthly')
  const [data, setData] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/reports?type=${type}&months=6`)
    const json = await res.json()
    setData(json.data ?? [])
    setLoading(false)
  }, [type])

  useEffect(() => { fetchReport() }, [fetchReport])

  async function handleExport() {
    const res = await fetch(`/api/export?type=report&reportType=${type}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.xlsx`
    a.click(); URL.revokeObjectURL(url)
  }

  const tabs: { key: ReportType; label: string }[] = [
    { key: 'monthly', label: 'Monthly Trend' },
    { key: 'region', label: 'Region-wise' },
    { key: 'rm', label: 'RM-wise' },
    { key: 'lender', label: 'Lender Approvals' },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Performance Reports" subtitle="Month-on-month analytics" />

      <div className="flex-1 p-6 space-y-5">
        {/* Tabs + Export */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setType(t.key); setLoading(true); setData([]) }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${type === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>
        ) : (
          <>
            {/* Chart */}
            {type === 'monthly' && data.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Performance Overview</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data as Record<string, unknown>[]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="totalLeads" name="Total Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="approved" name="Approved" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="disbursed" name="Disbursed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                {type === 'monthly' && <MonthlyTable data={data as MonthlyRow[]} />}
                {type === 'region' && <RegionTable data={data as RegionRow[]} />}
                {type === 'rm' && <RMTable data={data as RMRow[]} />}
                {type === 'lender' && <LenderTable data={data as LenderRow[]} />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface MonthlyRow { period: string; month?: string; totalLeads: number; approved: number; disbursed: number; leadValue: number; approvedValue: number; disbursedValue: number; approvalRate: number; disbursalRate: number }
interface RegionRow { id: string; name: string; totalLeads: number; approved: number; disbursed: number; leadValue: number; disbursedValue: number; approvalRate: number }
interface RMRow { id: string; name: string; role?: string; totalLeads: number; approved: number; disbursed: number; leadValue: number; disbursedValue: number; approvalRate: number }
interface LenderRow { id: string; name: string; code: string; totalLeads: number; approved: number; disbursed: number; approvedValue: number; disbursedValue: number; approvalRate: number; disbursalRate: number }

function formatRole(role?: string) {
  if (!role) return '—'
  return role.replace(/_/g, ' ')
}

function MonthlyTable({ data }: { data: MonthlyRow[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {['Month', 'Total Leads', 'Approved', 'Disbursed', 'Lead Value', 'Approved Value', 'Disbursed Value', 'Approval %', 'Disbursal %'].map(h => (
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map(r => (
          <tr key={r.month ?? r.period} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{r.period}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{r.totalLeads}</td>
            <td className="px-4 py-3 text-sm text-blue-700">{r.approved}</td>
            <td className="px-4 py-3 text-sm text-green-700">{r.disbursed}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{formatLakhs(r.leadValue)}</td>
            <td className="px-4 py-3 text-sm text-blue-600">{formatLakhs(r.approvedValue)}</td>
            <td className="px-4 py-3 text-sm text-green-600">{formatLakhs(r.disbursedValue)}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.approvalRate.toFixed(1)}%</td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.disbursalRate.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function RegionTable({ data }: { data: RegionRow[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {['Region', 'Total Leads', 'Approved', 'Disbursed', 'Lead Value', 'Disbursed Value', 'Approval %'].map(h => (
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map(r => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.name}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{r.totalLeads}</td>
            <td className="px-4 py-3 text-sm text-blue-700">{r.approved}</td>
            <td className="px-4 py-3 text-sm text-green-700">{r.disbursed}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{formatLakhs(r.leadValue)}</td>
            <td className="px-4 py-3 text-sm text-green-600">{formatLakhs(r.disbursedValue)}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.approvalRate.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LenderTable({ data }: { data: LenderRow[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {['Lender', 'Code', 'Total Leads', 'Approved', 'Disbursed', 'Approved Value', 'Disbursed Value', 'Approval %', 'Disbursal %'].map(h => (
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map(r => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.name}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{r.code}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{r.totalLeads}</td>
            <td className="px-4 py-3 text-sm text-blue-700">{r.approved}</td>
            <td className="px-4 py-3 text-sm text-green-700">{r.disbursed}</td>
            <td className="px-4 py-3 text-sm text-blue-600">{formatLakhs(r.approvedValue)}</td>
            <td className="px-4 py-3 text-sm text-green-600">{formatLakhs(r.disbursedValue)}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.approvalRate.toFixed(1)}%</td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.disbursalRate.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function RMTable({ data }: { data: RMRow[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {['RM Name', 'Role', 'Total Leads', 'Approved', 'Disbursed', 'Lead Value', 'Disbursed Value', 'Approval %'].map(h => (
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map(r => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.name}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{formatRole(r.role)}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{r.totalLeads}</td>
            <td className="px-4 py-3 text-sm text-blue-700">{r.approved}</td>
            <td className="px-4 py-3 text-sm text-green-700">{r.disbursed}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{formatLakhs(r.leadValue)}</td>
            <td className="px-4 py-3 text-sm text-green-600">{formatLakhs(r.disbursedValue)}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.approvalRate.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
