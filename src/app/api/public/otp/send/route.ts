import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendOtpSms } from '@/lib/sms'

export async function POST(req: NextRequest) {
  const { phone } = await req.json()

  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: 'Valid 10-digit phone number required' }, { status: 400 })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await db.otpToken.deleteMany({ where: { email: `pub_${phone}`, purpose: 'PUBLIC_PHONE_OTP' } })
  await db.otpToken.create({
    data: { email: `pub_${phone}`, emailOtp: otp, purpose: 'PUBLIC_PHONE_OTP', expiresAt },
  })

  const result = await sendOtpSms(phone, otp)
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Failed to send OTP. Please try again.' }, { status: 503 })
  }

  return NextResponse.json({
    success: true,
    // Only expose raw OTP in non-production for developer convenience
    _devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  })
}
