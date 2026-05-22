import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { buildClinicFilter, isAdmin } from '@/lib/permissions'

export async function GET() {
  const auth = await requireSession()
  if (auth.error) return auth.error

  const { user } = auth
  const clinicFilter = buildClinicFilter(user!.role, user!.regionIds, user!.clinicIds)
  const clinics = await db.clinic.findMany({ where: { ...clinicFilter, isActive: true }, select: { id: true } })
  const clinicIds = clinics.map(c => c.id)

  const [recentLeads, pendingCount, recentAudit] = await Promise.all([
    db.lead.findMany({
      where: { clinicId: { in: clinicIds } },
      include: {
        clinic: { select: { name: true } },
        lender: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    db.lead.count({ where: { clinicId: { in: clinicIds }, status: 'PENDING' } }),
    isAdmin(user!.role)
      ? db.auditLog.findMany({
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 6,
        })
      : db.auditLog.findMany({
          where: { userId: user!.id },
          orderBy: { createdAt: 'desc' },
          take: 6,
        }),
  ])

  return NextResponse.json({
    recentLeads,
    pendingCount,
    recentAudit,
  })
}
