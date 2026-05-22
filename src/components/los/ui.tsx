export function Panel({
  title,
  children,
  className = '',
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  )
}

export function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="text-sm text-gray-400 block mb-1">
        {label}
        {required ? ' *' : ''}
      </label>
      {children}
    </div>
  )
}

export const inputCls =
  'w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white'
export const selectCls =
  'w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white'
export const btnPrimary =
  'bg-lime-300 text-black px-6 py-2 rounded-lg font-semibold disabled:opacity-50'
export const btnSecondary = 'bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold'

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    APPROVED: 'bg-green-500/20 text-green-300',
    DISBURSED: 'bg-lime-500/20 text-lime-300',
    REJECTED: 'bg-red-500/20 text-red-300',
    CREDIT_REVIEW: 'bg-yellow-500/20 text-yellow-300',
    ENQUIRY_CREATED: 'bg-blue-500/20 text-blue-300',
  }
  const c = colors[status] ?? 'bg-white/10 text-gray-300'
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status.replace(/_/g, ' ')}</span>
}
