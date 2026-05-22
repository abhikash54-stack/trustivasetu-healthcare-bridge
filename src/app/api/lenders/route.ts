import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lenders = await db.lender.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  return NextResponse.json({ data: lenders })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const schema = z.object({ name: z.string().min(2), code: z.string().min(2).max(10) })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  const lender = await db.lender.create({ data: { ...parsed.data, code: parsed.data.code.toUpperCase() } })
  return NextResponse.json({ data: lender }, { status: 201 })
}
