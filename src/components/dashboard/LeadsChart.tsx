'use client'

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface MonthlyData {
  month: string
  leads: number
  approved: number
  disbursed: number
  leadValue: number
  approvedValue: number
  disbursedValue: number
}

export function LeadsTrendChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Lead Trend (6 Months)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="leads" name="Total Leads" stroke="#3b82f6" fill="url(#colorLeads)" strokeWidth={2} />
          <Area type="monotone" dataKey="approved" name="Approved" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="5 5" />
          <Area type="monotone" dataKey="disbursed" name="Disbursed" stroke="#10b981" fill="url(#colorDisbursed)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DisbursalComparisonChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Disbursal vs Approval Value (₹L)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number) => [`₹${value.toFixed(2)}L`, '']} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="approvedValue" name="Approved Value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="disbursedValue" name="Disbursed Value" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
