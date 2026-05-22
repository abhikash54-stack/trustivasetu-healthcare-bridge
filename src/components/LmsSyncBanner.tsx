'use client'

import type { SyncToast } from '@/lib/useLmsSync'

export function LmsSyncBanner({ toast }: { toast: SyncToast }) {
  if (!toast) return null
  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-md px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
        toast.type === 'ok'
          ? 'bg-lime-300 text-black'
          : 'bg-red-500 text-white'
      }`}
    >
      {toast.message}
    </div>
  )
}
