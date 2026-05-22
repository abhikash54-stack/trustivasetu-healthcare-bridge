/**
 * Trustiva LOS → LMS sync client
 * Set NEXT_PUBLIC_LMS_URL and NEXT_PUBLIC_LOS_API_KEY in .env.local
 */

function lmsBaseUrl() {
  if (typeof window !== 'undefined') return ''
  return process.env.NEXT_PUBLIC_LMS_URL ?? ''
}

const API_KEY = process.env.LOS_API_KEY ?? process.env.NEXT_PUBLIC_LOS_API_KEY ?? ''

async function losPost(path: string, data: Record<string, unknown>) {
  if (!API_KEY) {
    throw new Error('LOS_API_KEY missing — set in Vercel env')
  }
  const res = await fetch(`${lmsBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-los-api-key': API_KEY,
    },
    body: JSON.stringify(data),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `LMS sync failed (${res.status})`)
  return json
}

export async function syncEnquiryToLMS(
  leadForm: Record<string, unknown>,
  extra?: Record<string, unknown>
) {
  return losPost('/api/los/sync/enquiry', {
    ...leadForm,
    ...extra,
    losEnquiryId:
      extra?.losEnquiryId ??
      `LOS-${leadForm.mobileNumber}-${String(leadForm.patientName ?? '').replace(/\s/g, '')}`,
  })
}

export async function syncClinicToLMS(hospitalData: Record<string, unknown>) {
  const name = String(hospitalData.fullName ?? hospitalData.name ?? '')
  return losPost('/api/los/sync/clinic', {
    externalId:
      hospitalData.externalId ??
      `LOS-H-${name.replace(/\s+/g, '').slice(0, 24).toUpperCase()}`,
    regionCode: hospitalData.regionCode ?? regionCodeFromCity(String(hospitalData.city ?? '')),
    ...hospitalData,
  })
}

export async function syncCommercialToLMS(data: Record<string, unknown>) {
  return losPost('/api/los/sync/commercial', data)
}

export async function syncUserToLMS(user: Record<string, unknown>) {
  return losPost('/api/los/sync/user', user)
}

/** Any LOS sidebar tab → LMS DB (leads, credit, collections, lenders, etc.) */
export async function syncActivityToLMS(
  activityType: string,
  data: Record<string, unknown>
) {
  return losPost('/api/los/sync/activity', {
    activityType,
    ...data,
    menu: data.menu ?? activityType,
  })
}

function regionCodeFromCity(city: string): string {
  const c = city.toUpperCase()
  if (c.includes('DELHI') || c.includes('JAIPUR') || c.includes('CHANDIGARH') || c.includes('LUCKNOW')) return 'NORTH'
  if (c.includes('CHENNAI') || c.includes('HYDERABAD') || c.includes('BANGALORE') || c.includes('KOCHI')) return 'SOUTH'
  if (c.includes('KOLKATA')) return 'EAST'
  return 'WEST'
}
