'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LosProvider } from './LosProvider'
import { LosShell } from './LosShell'

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    if (!localStorage.getItem('trustiva-user')) router.push('/login')
  }, [router])
  return <>{children}</>
}

export default function LosDashboard() {
  return (
    <AuthGate>
      <LosProvider>
        <LosShell />
      </LosProvider>
    </AuthGate>
  )
}
