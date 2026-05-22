import { NextRequest, NextResponse } from 'next/server'

export function verifyLosRequest(req: NextRequest): boolean {
  const key = req.headers.get('x-los-api-key') ?? req.headers.get('x-webhook-secret')
  const expected = process.env.LOS_API_KEY ?? process.env.WEBHOOK_SECRET
  return !!key && !!expected && key === expected
}

export function losUnauthorized() {
  return NextResponse.json({ error: 'Unauthorized — invalid LOS API key' }, { status: 401 })
}
