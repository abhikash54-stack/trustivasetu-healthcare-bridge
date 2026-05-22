'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { LeadsTrendChart, DisbursalComparisonChart } from '@/components/dashboard/LeadsChart'
import { LenderApprovalChart } from '@/components/dashboard/LenderChart'
import { TargetProgress } from '@/components/dashboard/TargetProgress'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { formatLakhs } from '@/lib/utils'
import type { DashboardMetrics } from '@/types'

const defaultFilters = { dateFrom: '', dateTo: '', regionId: '', clinicId: '', lenderId: '', rmId: '' }

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [activity, setActivity] = useState<Parameters<typeof RecentActivity>[0]['data']>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(defaultFilters)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const res = await fetch(`/api/dashboard?${params}`)
    const data = await res.json()
    setMetrics(data)
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  useEffect(() => {
    fetch('/api/activity')
      .then(r => r.json())
      .then(json => {
        if (Array.isArray(json.recentLeads) && Array.isArray(json.recentAudit)) {
          setActivity(json)
        } else {
          setActivity({ recentLeads: [], pendingCount: 0, recentAudit: [] })
        }
      })
      .catch(() => setActivity({ recentLeads: [], pendingCount: 0, recentAudit: [] }))
  }, [metrics])

  async function handleExport() {
    const params = new URLSearchParams({ type: 'dashboard' })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const res = await fetch(`/api/export?${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `dashboard-${new Date().toISOString().split('T')[0]}.xlsx`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Dashboard" subtitle="Business overview and analytics" />

      <div className="flex-1 p-6 space-y-5">
        <DashboardFilters filters={filters} onChange={setFilters} showExport onExport={handleExport} />

        {/* Metric Cards Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard loading={loading} title="Total Leads" value={metrics?.totalLeads ?? 0}
            icon={<IconUsers />} color="blue" />
          <MetricCard loading={loading} title="Approved Leads" value={metrics?.totalApproved ?? 0}
            subValue={`${(metrics?.approvalRate ?? 0).toFixed(1)}% approval rate`}
            icon={<IconCheck />} color="teal" />
          <MetricCard loading={loading} title="Disbursed Leads" value={metrics?.totalDisbursed ?? 0}
            subValue={`${(metrics?.disbursalRate ?? 0).toFixed(1)}% disbursal rate`}
            icon={<IconMoney />} color="green" />
          <MetricCard loading={loading} title="Onboarded Clinics" value={metrics?.totalClinics ?? 0}
            icon={<IconClinic />} color="purple" />
        </div>

        {/* Metric Cards Row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard loading={loading} title="Total Lead Value"
            value={formatLakhs(metrics?.totalLeadValue)}
            icon={<IconChart />} color="orange" />
          <MetricCard loading={loading} title="Total Approved Value"
            value={formatLakhs(metrics?.totalApprovedValue)}
            icon={<IconChart />} color="teal" />
          <MetricCard loading={loading} title="Total Disbursed Value"
            value={formatLakhs(metrics?.totalDisbursedValue)}
            icon={<IconChart />} color="green" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadsTrendChart data={metrics?.monthlyTrend ?? []} />
          <DisbursalComparisonChart data={metrics?.monthlyTrend ?? []} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LenderApprovalChart data={metrics?.lenderWise ?? []} />
          {metrics?.target && <TargetProgress data={metrics.target} />}
        </div>

        <RecentActivity data={activity} />
      </div>
    </div>
  )
}

function IconUsers() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
}
function IconCheck() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
}
function IconMoney() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
}
function IconClinic() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
}
function IconChart() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
}
