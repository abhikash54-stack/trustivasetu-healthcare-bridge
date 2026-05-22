import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleWebhookRequest } from '@/lib/webhooks'

export async function POST(req: Request) {
  return handleWebhookRequest(req as import('next/server').NextRequest, 'CLINIC', async ({ event, data }) => {
    if (event !== 'clinic.created' && event !== 'clinic.updated') {
      return NextResponse.json({ success: true, event, ignored: true })
    }

    const d = data as Record<string, unknown>
    const region = await db.region.findFirst({ where: { code: String(d.regionCode ?? '') } })
    if (!region) return NextResponse.json({ error: 'Region not found' }, { status: 404 })

    const clinicPayload = {
      name: String(d.name ?? ''),
      address: String(d.address ?? ''),
      contactPerson: String(d.contactPerson ?? ''),
      contactNumber: String(d.contactNumber ?? ''),
      email: d.email ? String(d.email) : null,
      accountNumber: d.accountNumber ? String(d.accountNumber) : null,
      businessPotential: d.businessPotential ? Number(d.businessPotential) : null,
      regionId: region.id,
      externalId: d.externalId ? String(d.externalId) : null,
    }

    const existing = d.externalId
      ? await db.clinic.findUnique({ where: { externalId: String(d.externalId) } })
      : null

    if (existing) {
      await db.clinic.update({ where: { id: existing.id }, data: clinicPayload })
      return NextResponse.json({ success: true, action: 'updated', id: existing.id })
    }

    const clinic = await db.clinic.create({ data: clinicPayload })
    return NextResponse.json({ success: true, action: 'created', id: clinic.id })
  })
}
