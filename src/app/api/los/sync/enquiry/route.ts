import { NextRequest, NextResponse } from 'next/server'
import { losUnauthorized, verifyLosRequest } from '@/lib/los-auth'
import { syncLosEnquiry } from '@/lib/los-mapper'
import { db } from '@/lib/db'
import { logWebhookEvent } from '@/lib/webhooks'

export async function POST(req: NextRequest) {
  if (!verifyLosRequest(req)) return losUnauthorized()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  await logWebhookEvent({
    event: 'los.enquiry.sync',
    entity: 'LEAD',
    payload: body,
    status: 'RECEIVED',
  })

  try {
    const result = await syncLosEnquiry(body)

    await db.auditLog.create({
      data: {
        action: result.action === 'created' ? 'CREATE' : 'UPDATE',
        entity: 'Lead',
        entityId: result.lead.id,
        details: JSON.stringify({ source: 'los', hospital: body.hospitalName }),
      },
    })

    await logWebhookEvent({
      event: 'los.enquiry.sync',
      entity: 'LEAD',
      payload: body,
      status: 'PROCESSED',
      response: JSON.stringify({ id: result.lead.id, action: result.action }),
    })

    return NextResponse.json({
      success: true,
      action: result.action,
      leadId: result.lead.id,
      clinicId: result.clinic.id,
      message: 'Enquiry synced to Trustiva LMS',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    await logWebhookEvent({
      event: 'los.enquiry.sync',
      entity: 'LEAD',
      payload: body,
      status: 'FAILED',
      error: message,
    })
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
