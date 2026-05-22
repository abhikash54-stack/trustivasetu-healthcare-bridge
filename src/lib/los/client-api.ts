import { EMPTY_DB } from './defaults'
import type { LosDatabase } from './types'

export async function fetchLosDb(): Promise<LosDatabase> {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('trustiva-los-db')
    if (raw) {
      try {
        return { ...EMPTY_DB, ...JSON.parse(raw) } as LosDatabase
      } catch {
        /* fall through */
      }
    }
  }
  try {
    const res = await fetch('/api/los/db', { cache: 'no-store' })
    if (res.ok) return res.json()
  } catch {
    /* serverless: no persistent disk */
  }
  return { ...EMPTY_DB }
}

export async function saveLosDb(db: LosDatabase): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('trustiva-los-db', JSON.stringify(db))
  }
  try {
    await fetch('/api/los/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db),
    })
  } catch {
    /* optional on Vercel */
  }
}
