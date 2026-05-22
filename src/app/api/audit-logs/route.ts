import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = await requirePermission('AUDIT_LOG_VIEW')
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '30'), 100)
  const entity = searchParams.get('entity')
  const action = searchParams.get('action')
  const userId = searchParams.get('userId')

  const where: Record<string, unknown> = {}
  if (entity) where.entity = entity
  if (action) where.action = action
  if (userId) where.userId = userId

  const [total, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({ data: logs, total, page, pageSize })
}
