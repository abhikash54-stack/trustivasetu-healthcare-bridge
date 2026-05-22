/**
 * Call from your Trustiva LOS (Healthcare Partner Console) frontend.
 * Set NEXT_PUBLIC_LMS_URL and NEXT_PUBLIC_LOS_API_KEY in LOS .env
 */

const LMS_URL =
  process.env.NEXT_PUBLIC_LMS_URL ?? 'https://data.trustivasetu.com'
const API_KEY = process.env.NEXT_PUBLIC_LOS_API_KEY ?? ''

async function losPost(path: string, data: Record<string, unknown>) {
  const res = await fetch(`${LMS_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-los-api-key': API_KEY,
    },
    body: JSON.stringify(data),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? `LMS sync failed (${res.status})`)
  return json
}

/** Call when "Create Enquiry" / OTP verified / Final Submit */
export async function syncEnquiryToLMS(leadForm: Record<string, unknown>, extra?: Record<string, unknown>) {
  return losPost('/api/los/sync/enquiry', {
    ...leadForm,
    ...extra,
    losEnquiryId: extra?.losEnquiryId ?? `LOS-${leadForm.mobileNumber}-${leadForm.patientName}`,
  })
}

/** Call on hospital create OR update (same payload — LMS upserts by externalId) */
export async function syncClinicToLMS(hospitalData: Record<string, unknown>) {
  return losPost('/api/los/sync/clinic', {
    externalId: hospitalData.externalId ?? hospitalData.hospitalId,
    ...hospitalData,
  })
}

/** Hospital commercial / tariff update from LOS */
export async function syncCommercialToLMS(data: Record<string, unknown>) {
  return losPost('/api/los/sync/commercial', data)
}

/** Call on user create OR update (@trustivasetu.com emails) */
export async function syncUserToLMS(user: Record<string, unknown>) {
  return losPost('/api/los/sync/user', user)
}
