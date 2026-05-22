import { NextResponse } from 'next/server'
import { LeadStatus } from '@prisma/client'
import { db } from '@/lib/db'
import { handleWebhookRequest } from '@/lib/webhooks'

export async function POST(req: Request) {
  return handleWebhookRequest(req as import('next/server').NextRequest, 'LEAD', async ({ event, data }) => {
    if (event !== 'lead.created' && event !== 'lead.updated') {
      return NextResponse.json({ success: true, event, ignored: true })
    }

    const leadData = data as Record<string, unknown>

    let clinicId: string | undefined
    if (leadData.clinicExternalId) {
      const clinic = await db.clinic.findUnique({ where: { externalId: String(leadData.clinicExternalId) } })
      clinicId = clinic?.id
    }

    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    let lenderId: string | undefined
    if (leadData.lenderCode) {
      const lender = await db.lender.findUnique({ where: { code: String(leadData.lenderCode) } })
      lenderId = lender?.id
    }

    const status = (String(leadData.status ?? 'PENDING') as LeadStatus)

    const leadPayload = {
      applicantName: String(leadData.applicantName ?? ''),
      phone: leadData.phone ? String(leadData.phone) : null,
      email: leadData.email ? String(leadData.email) : null,
      amount: Number(leadData.amount ?? 0),
      status,
      approvedAmount: leadData.approvedAmount ? Number(leadData.approvedAmount) : null,
      disbursedAmount: leadData.disbursedAmount ? Number(leadData.disbursedAmount) : null,
      applicationDate: leadData.applicationDate ? new Date(String(leadData.applicationDate)) : new Date(),
      approvalDate: leadData.approvalDate ? new Date(String(leadData.approvalDate)) : null,
      disbursalDate: leadData.disbursalDate ? new Date(String(leadData.disbursalDate)) : null,
      clinicId,
      lenderId: lenderId ?? null,
      externalId: leadData.externalId ? String(leadData.externalId) : null,
      remarks: leadData.remarks ? String(leadData.remarks) : null,
    }

    const existingLead = leadData.externalId
      ? await db.lead.findUnique({ where: { externalId: String(leadData.externalId) } })
      : null

    if (existingLead) {
      await db.lead.update({ where: { id: existingLead.id }, data: leadPayload })
      return NextResponse.json({ success: true, action: 'updated', id: existingLead.id })
    }

    const lead = await db.lead.create({ data: leadPayload })
    return NextResponse.json({ success: true, action: 'created', id: lead.id })
  })
}
