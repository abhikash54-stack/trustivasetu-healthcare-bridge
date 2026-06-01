/**
 * SMS OTP delivery via MSG91 SendOTP API.
 * Required env var: MSG91_AUTH_KEY
 * Optional env var: MSG91_TEMPLATE_ID (recommended for DLT compliance in India)
 * In non-production with no key set, falls back to console log.
 */
export async function sendOtpSms(
  phone: string,
  otp: string,
): Promise<{ success: boolean; error?: string }> {
  const authKey = process.env.MSG91_AUTH_KEY

  if (!authKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SMS DEV] OTP for +91${phone}: ${otp}`)
      return { success: true }
    }
    console.error('[SMS] MSG91_AUTH_KEY not configured')
    return { success: false, error: 'SMS service not configured. Please contact support.' }
  }

  const templateId = process.env.MSG91_TEMPLATE_ID

  try {
    const body: Record<string, string> = {
      mobile: `91${phone}`,
      otp,
    }
    if (templateId) body.template_id = templateId

    const res = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = (await res.json()) as { type?: string; message?: string }
    if (data.type === 'success') return { success: true }
    console.error('[SMS] MSG91 error:', data)
    return { success: false, error: data.message ?? 'OTP could not be delivered. Please try again.' }
  } catch (err) {
    console.error('[SMS] Delivery failed:', err)
    return { success: false, error: 'OTP could not be delivered. Please try again.' }
  }
}
