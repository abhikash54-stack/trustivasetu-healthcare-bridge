import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/lib/api-auth'
import { readDb, writeDb } from '@/lib/los/server-store'
import type { LosDatabase } from '@/lib/los/types'

async function requireAdmin() {
  const session = await getRequestSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const err = await requireAdmin()
  if (err) return err
  return NextResponse.json(readDb())
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err
  try {
    const body = await req.json() as LosDatabase
    writeDb(body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Save failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err
  try {
    const patch = await req.json() as Partial<LosDatabase>
    const db = readDb()
    writeDb({ ...db, ...patch })
    return NextResponse.json(readDb())
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Patch failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
