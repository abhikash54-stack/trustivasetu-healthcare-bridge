import { NextRequest, NextResponse } from 'next/server'
import { WebhookEntity, WebhookStatus } from '@prisma/client'
import { db } from '@/lib/db'

export function verifyWebhookSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-webhook-secret')
  return !!secret && secret === process.env.WEBHOOK_SECRET
}

export async function logWebhookEvent(params: {
  event: string
  entity: WebhookEntity
  payload: unknown
  status: WebhookStatus
  response?: string
  error?: string
}) {
  return db.webhookEvent.create({
    data: {
      event: params.event,
      entity: params.entity,
      payload: params.payload as object,
      status: params.status,
      response: params.response,
      error: params.error,
      processedAt: params.status !== 'RECEIVED' ? new Date() : undefined,
    },
  })
}

export async function handleWebhookRequest(
  req: NextRequest,
  entity: WebhookEntity,
  handler: (body: { event: string; data: unknown }) => Promise<NextResponse>
) {
  if (!verifyWebhookSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { event: string; data: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { event, data } = body
  if (!event) {
    return NextResponse.json({ error: 'Missing event' }, { status: 400 })
  }

  await logWebhookEvent({ event, entity, payload: body, status: 'RECEIVED' })

  try {
    const response = await handler(body)
    const json = await response.clone().json().catch(() => ({}))
    await logWebhookEvent({
      event,
      entity,
      payload: body,
      status: response.ok ? 'PROCESSED' : 'FAILED',
      response: JSON.stringify(json),
      error: response.ok ? undefined : json.error,
    })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed'
    await logWebhookEvent({
      event,
      entity,
      payload: body,
      status: 'FAILED',
      error: message,
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
