import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { losUnauthorized, verifyLosRequest } from '@/lib/los-auth'
import { db } from '@/lib/db'

/** LOS hospital commercial terms — merged into clinic.metadata.commercials */
export async function POST(req: NextRequest) {
  if (!verifyLosRequest(req)) return losUnauthorized()

  const body = await req.json() as Record<string, unknown>
  const externalId = body.externalId ? String(body.externalId) : null
  const hospitalName = String(body.hospitalName ?? body.fullName ?? body.name ?? '').trim()

  if (!externalId && !hospitalName) {
    return NextResponse.json({ error: 'externalId or hospitalName required' }, { status: 400 })
  }

  const clinic = externalId
    ? await db.clinic.findUnique({ where: { externalId } })
    : await db.clinic.findFirst({
        where: { name: { equals: hospitalName, mode: 'insensitive' } },
      })

  if (!clinic) {
    return NextResponse.json({ error: 'Hospital not found in LMS — sync hospital first' }, { status: 404 })
  }

  const commercials = body.commercials ?? body.commercial ?? body
  const prev = (clinic.metadata as Record<string, unknown> | null) ?? {}
  const metadata = {
    ...prev,
    commercials,
    commercialUpdatedAt: new Date().toISOString(),
    source: 'los',
  } as Prisma.InputJsonValue

  const updated = await db.clinic.update({
    where: { id: clinic.id },
    data: {
      metadata,
      businessPotential: body.businessPotential != null ? Number(body.businessPotential) : clinic.businessPotential,
    },
  })

  await db.auditLog.create({
    data: { action: 'UPDATE', entity: 'Clinic', entityId: clinic.id, details: '{"source":"los","type":"commercial"}' },
  })

  return NextResponse.json({ success: true, action: 'updated', clinicId: updated.id })
}
