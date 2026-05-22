import { cn, formatLakhs, getGrowthColor, formatPercent } from '@/lib/utils'

interface TargetData {
  leadsTarget: number
  disbursalTarget: number
  leadsAchieved: number
  disbursalAchieved: number
  leadsGrowth: number
  disbursalGrowth: number
  requiredLeadRunRate: number
  requiredDisbursalRunRate: number
  currentLeadRunRate: number
  currentDisbursalRunRate: number
}

export function TargetProgress({ data }: { data: TargetData }) {
  const leadsPercent = data.leadsTarget > 0 ? Math.min((data.leadsAchieved / data.leadsTarget) * 100, 100) : 0
  const disbursalPercent = data.disbursalTarget > 0
    ? Math.min((data.disbursalAchieved / data.disbursalTarget) * 100, 100) : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Target Progress</h3>

      <div className="space-y-5">
        {/* Leads */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700">Leads</span>
            <span className="text-gray-500">{data.leadsAchieved} / {data.leadsTarget}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={cn('h-2.5 rounded-full transition-all', leadsPercent >= 100 ? 'bg-green-500' : 'bg-blue-500')}
              style={{ width: `${leadsPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{leadsPercent.toFixed(1)}% achieved</span>
            <span className={getGrowthColor(data.leadsGrowth)}>{formatPercent(data.leadsGrowth)} growth</span>
          </div>
        </div>

        {/* Disbursals */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700">Disbursal Value</span>
            <span className="text-gray-500">{formatLakhs(data.disbursalAchieved)} / {formatLakhs(data.disbursalTarget)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={cn('h-2.5 rounded-full transition-all', disbursalPercent >= 100 ? 'bg-green-500' : 'bg-purple-500')}
              style={{ width: `${disbursalPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{disbursalPercent.toFixed(1)}% achieved</span>
            <span className={getGrowthColor(data.disbursalGrowth)}>{formatPercent(data.disbursalGrowth)} growth</span>
          </div>
        </div>
      </div>

      {/* Run rates */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Lead Run Rate</p>
          <p className="text-sm font-semibold text-gray-800">Current: {data.currentLeadRunRate.toFixed(0)}/mo</p>
          <p className="text-xs text-orange-600">Required: {data.requiredLeadRunRate.toFixed(0)}/day</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Disbursal Run Rate</p>
          <p className="text-sm font-semibold text-gray-800">Current: {formatLakhs(data.currentDisbursalRunRate)}/mo</p>
          <p className="text-xs text-orange-600">Required: {formatLakhs(data.requiredDisbursalRunRate)}/day</p>
        </div>
      </div>
    </div>
  )
}
