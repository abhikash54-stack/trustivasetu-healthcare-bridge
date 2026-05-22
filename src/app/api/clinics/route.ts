import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { buildClinicFilter, hasPermission } from '@/lib/permissions'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  accountNumber: z.string().optional(),
  contactPerson: z.string().min(2),
  contactNumber: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  businessPotential: z.number().optional(),
  regionId: z.string().cuid(),
  assignedRMId: z.string().cuid().optional().or(z.literal('')),
  externalId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const minimal = searchParams.get('minimal') === '1'
  const search = searchParams.get('search') ?? ''
  const regionId = searchParams.get('regionId')
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '20'), 100)

  const { role, regionIds, clinicIds } = session.user
  const clinicFilter: Record<string, unknown> = buildClinicFilter(role, regionIds, clinicIds)
  if (regionId) clinicFilter.regionId = regionId
  if (search) clinicFilter.name = { contains: search }

  if (minimal) {
    const clinics = await db.clinic.findMany({
      where: { ...clinicFilter, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: clinics })
  }

  const [total, clinics] = await Promise.all([
    db.clinic.count({ where: { ...clinicFilter, isActive: true } }),
    db.clinic.findMany({
      where: { ...clinicFilter, isActive: true },
      include: { region: { select: { id: true, name: true } }, assignedRM: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const now = new Date()
  const mtdStart = startOfMonth(now)
  const prevStart = startOfMonth(subMonths(now, 1))
  const prevEnd = endOfMonth(subMonths(now, 1))

  const clinicsWithStats = await Promise.all(
    clinics.map(async clinic => {
      const [totalLeads, mtdLeads, lmtdLeads, totalDisbAgg, mtdDisbAgg, lmtdDisbAgg] = await Promise.all([
        db.lead.count({ where: { clinicId: clinic.id } }),
        db.lead.count({ where: { clinicId: clinic.id, applicationDate: { gte: mtdStart } } }),
        db.lead.count({ where: { clinicId: clinic.id, applicationDate: { gte: prevStart, lte: prevEnd } } }),
        db.lead.aggregate({ _sum: { disbursedAmount: true }, where: { clinicId: clinic.id, status: 'DISBURSED' } }),
        db.lead.aggregate({ _sum: { disbursedAmount: true }, where: { clinicId: clinic.id, status: 'DISBURSED', disbursalDate: { gte: mtdStart } } }),
        db.lead.aggregate({ _sum: { disbursedAmount: true }, where: { clinicId: clinic.id, status: 'DISBURSED', disbursalDate: { gte: prevStart, lte: prevEnd } } }),
      ])

      const mtdDisb = mtdDisbAgg._sum.disbursedAmount ?? 0
      const lmtdDisb = lmtdDisbAgg._sum.disbursedAmount ?? 0

      return {
        ...clinic,
        totalLeads,
        mtdLeads,
        lmtdLeads,
        totalDisbursalValue: totalDisbAgg._sum.disbursedAmount ?? 0,
        mtdDisbursalValue: mtdDisb,
        lmtdDisbursalValue: lmtdDisb,
        leadsGrowth: lmtdLeads > 0 ? ((mtdLeads - lmtdLeads) / lmtdLeads) * 100 : (mtdLeads > 0 ? 100 : 0),
        disbursalGrowth: lmtdDisb > 0 ? ((mtdDisb - lmtdDisb) / lmtdDisb) * 100 : (mtdDisb > 0 ? 100 : 0),
      }
    })
  )

  return NextResponse.json({ data: clinicsWithStats, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(session.user.role, 'CLINIC_CREATE')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data
  const clinic = await db.clinic.create({
    data: {
      name: data.name,
      address: data.address,
      accountNumber: data.accountNumber,
      contactPerson: data.contactPerson,
      contactNumber: data.contactNumber,
      email: data.email || null,
      businessPotential: data.businessPotential,
      regionId: data.regionId,
      assignedRMId: data.assignedRMId || null,
      externalId: data.externalId,
    },
    include: { region: true, assignedRM: { select: { id: true, name: true } } },
  })

  await db.auditLog.create({ data: { userId: session.user.id, action: 'CREATE', entity: 'Clinic', entityId: clinic.id } })
  return NextResponse.json({ data: clinic }, { status: 201 })
}
