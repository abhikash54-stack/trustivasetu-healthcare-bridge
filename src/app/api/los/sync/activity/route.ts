import { NextRequest, NextResponse } from 'next/server'
import { losUnauthorized, verifyLosRequest } from '@/lib/los-auth'
import { syncLosActivity } from '@/lib/los-activity'
import { logWebhookEvent } from '@/lib/webhooks'

export async function POST(req: NextRequest) {
  if (!verifyLosRequest(req)) return losUnauthorized()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = `los.activity.${String(body.activityType ?? 'operations')}`
  await logWebhookEvent({ event, entity: 'LEAD', payload: body, status: 'RECEIVED' })

  try {
    const result = await syncLosActivity(body)
    await logWebhookEvent({
      event,
      entity: 'LEAD',
      payload: body,
      status: 'PROCESSED',
      response: JSON.stringify(result),
    })
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    await logWebhookEvent({ event, entity: 'LEAD', payload: body, status: 'FAILED', error: message })
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
