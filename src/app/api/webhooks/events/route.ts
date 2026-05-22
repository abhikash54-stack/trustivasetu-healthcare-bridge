import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = await requirePermission('AUDIT_LOG_VIEW')
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '30'), 100)
  const status = searchParams.get('status')
  const entity = searchParams.get('entity')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (entity) where.entity = entity

  const [total, events] = await Promise.all([
    db.webhookEvent.count({ where }),
    db.webhookEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({ data: events, total, page, pageSize })
}
