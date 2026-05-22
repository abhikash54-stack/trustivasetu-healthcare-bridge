import { NextRequest, NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/los/server-store'
import type { LosDatabase } from '@/lib/los/types'

export async function GET() {
  return NextResponse.json(readDb())
}

export async function POST(req: NextRequest) {
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
