'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'

interface LenderData {
  lenderId: string
  lenderName: string
  totalLeads: number
  approved: number
  approvalRate: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

export function LenderApprovalChart({ data }: { data: LenderData[] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Lender-wise Approval Rate</h3>
        <p className="text-sm text-gray-400 text-center py-10">No lender data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Lender-wise Approval Rate (%)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
          <YAxis dataKey="lenderName" type="category" tick={{ fontSize: 11 }} width={80} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Approval Rate']}
          />
          <Bar dataKey="approvalRate" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {data.map((d, i) => (
          <div key={d.lenderId} className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span>{d.lenderName}</span>
            </div>
            <span className="font-medium">{d.totalLeads} leads · {d.approvalRate.toFixed(1)}% approved</span>
          </div>
        ))}
      </div>
    </div>
  )
}
