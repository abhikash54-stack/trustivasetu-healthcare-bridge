import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendOtpSms } from '@/lib/sms'
import { checkOtpSendRateLimit } from '@/lib/rate-limit'

const isBypass = () =>
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_OTP_BYPASS === 'true'

export async function POST(req: NextRequest) {
  const { phone } = await req.json()

  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: 'Valid 10-digit phone number required' }, { status: 400 })
  }

  const rateLimit = await checkOtpSendRateLimit(phone)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many OTP requests. Please wait 5 minutes before trying again.' },
      { status: 429 },
    )
  }

  // When bypass is active, always use 123456 so verify step can find it in DB
  const otp = isBypass() ? '123456' : Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await db.otpToken.deleteMany({ where: { email: `pub_${phone}`, purpose: 'PUBLIC_PHONE_OTP' } })
  await db.otpToken.create({
    data: { email: `pub_${phone}`, emailOtp: otp, purpose: 'PUBLIC_PHONE_OTP', expiresAt },
  })

  // Skip SMS when bypass is active — always succeed so chatbot reaches OTP step
  if (!isBypass()) {
    const result = await sendOtpSms(phone, otp)
    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Failed to send OTP. Please try again.' }, { status: 503 })
    }
  }

  return NextResponse.json({
    success: true,
    _devOtp: isBypass() ? otp : undefined,
  })
}
