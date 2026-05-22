import { Suspense } from 'react'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { LeadsPageContent } from './LeadsPageContent'

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-6"><PageLoader /></div>}>
      <LeadsPageContent />
    </Suspense>
  )
}
