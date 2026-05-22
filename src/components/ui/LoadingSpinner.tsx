import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status">
      <div className={cn('animate-spin rounded-full border-2 border-brand-200 border-b-brand-600', sizes[size])} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  )
}

export function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex justify-center py-20">
      <LoadingSpinner label={label} />
    </div>
  )
}
