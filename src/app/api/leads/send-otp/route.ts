import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { sendOtpSms } from '@/lib/sms'

const isBypass = () =>
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_OTP_BYPASS === 'true'

export async function POST(req: NextRequest) {
  const session = await getRequestSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await req.json()
  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: 'Valid 10-digit phone required' }, { status: 400 })
  }

  // When bypass is active, always use 123456 so verify step can find it in DB
  const otp = isBypass() ? '123456' : Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await db.otpToken.deleteMany({ where: { email: phone, purpose: 'PHONE_OTP' } })
  await db.otpToken.create({
    data: { email: phone, emailOtp: otp, purpose: 'PHONE_OTP', expiresAt },
  })

  // Skip SMS when bypass is active — always succeed
  if (!isBypass()) {
    const result = await sendOtpSms(phone, otp)
    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Failed to send OTP. Please try again.' }, { status: 503 })
    }
  }

  return NextResponse.json({
    success: true,
    message: 'OTP sent',
    _devOtp: isBypass() ? otp : undefined,
  })
}
