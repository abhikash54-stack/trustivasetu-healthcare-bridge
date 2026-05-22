import { LeadStatus, Prisma, UserRole } from '@prisma/client'
import { db } from '@/lib/db'

/** LOS hospital label e.g. "Hospital1 - HYDERABAD" */
export async function resolveClinicByHospitalName(hospitalName: string) {
  const trimmed = hospitalName.trim()
  if (!trimmed) return null

  const shortName = trimmed.split(' - ')[0]?.trim() ?? trimmed
  const cityHint = trimmed.split(' - ')[1]?.trim()?.toUpperCase() ?? ''

  let clinic = await db.clinic.findFirst({
    where: {
      OR: [
        { name: { equals: trimmed, mode: 'insensitive' } },
        { name: { contains: shortName, mode: 'insensitive' } },
        { externalId: shortName.replace(/\s+/g, '').toUpperCase() },
      ],
    },
  })

  if (clinic) return clinic

  const regionCode = cityHint.includes('DELHI') || cityHint.includes('JAIPUR') || cityHint.includes('CHANDIGARH')
    ? 'NORTH'
    : cityHint.includes('CHENNAI') || cityHint.includes('HYDERABAD') || cityHint.includes('BANGALORE') || cityHint.includes('KOCHI')
      ? 'SOUTH'
      : cityHint.includes('KOLKATA')
        ? 'EAST'
        : 'WEST'

  const region = await db.region.findUnique({ where: { code: regionCode } })
    ?? await db.region.findFirst()

  if (!region) return null

  return db.clinic.create({
    data: {
      name: trimmed,
      externalId: `LOS-${shortName.replace(/\s+/g, '').toUpperCase()}`,
      address: cityHint ? `${shortName}, ${cityHint}` : trimmed,
      contactPerson: 'LOS Onboarding',
      contactNumber: '0000000000',
      regionId: region.id,
      metadata: { source: 'los', autoCreated: true },
    },
  })
}

export function mapLosRole(roleLabel: string): UserRole {
  const r = roleLabel.toLowerCase()
  if (r.includes('admin') || r.includes('operations desk')) return UserRole.ADMIN
  if (r.includes('growth') || r.includes('regional') || r.includes('manager')) return UserRole.REGIONAL_MANAGER
  return UserRole.TEAM_MEMBER
}

export function mapLosEnquiryToLead(data: Record<string, unknown>) {
  const medicalEstimate = Number(data.medicalEstimate ?? data.financingRequired ?? 0)
  const amount = medicalEstimate > 0 ? medicalEstimate / 100000 : 1

  const remarksParts = [
    data.enquiryType && `Enquiry: ${data.enquiryType}`,
    data.motherName && `Guardian: ${data.motherName}`,
    data.customerType && `Payment: ${data.customerType}`,
    data.bedType && `Bed: ${data.bedType}`,
    data.treatmentName && `Treatment: ${data.treatmentName}`,
    data.financingRequired && `Financing: ${data.financingRequired}`,
    data.remarks && `Notes: ${data.remarks}`,
  ].filter(Boolean)

  const losEnquiryId = data.losEnquiryId
    ? String(data.losEnquiryId)
    : data.mobileNumber && data.patientName
      ? `LOS-${data.mobileNumber}-${String(data.patientName).replace(/\s/g, '')}`
      : undefined

  return {
    applicantName: String(data.patientName ?? data.applicantName ?? 'Unknown'),
    phone: data.mobileNumber ? String(data.mobileNumber) : data.phone ? String(data.phone) : null,
    email: data.email ? String(data.email) : null,
    amount: Math.max(amount, 0.01),
    status: (String(data.status ?? 'PENDING') as LeadStatus),
    applicationDate: data.admissionDate ? new Date(String(data.admissionDate)) : new Date(),
    remarks: remarksParts.join(' | ') || null,
    enquiryType: data.enquiryType ? String(data.enquiryType) : null,
    motherName: data.motherName ? String(data.motherName) : null,
    treatmentName: data.treatmentName ? String(data.treatmentName) : null,
    metadata: data as Prisma.InputJsonValue,
    losEnquiryId,
  }
}

export async function syncLosEnquiry(payload: Record<string, unknown>) {
  const hospitalName = String(payload.hospitalName ?? '')
  const clinic = await resolveClinicByHospitalName(hospitalName)
  if (!clinic) {
    throw new Error(`Could not resolve clinic for hospital: ${hospitalName}`)
  }

  const leadData = mapLosEnquiryToLead(payload)
  const losId = leadData.losEnquiryId

  if (losId) {
    const existing = await db.lead.findUnique({ where: { losEnquiryId: losId } })
    if (existing) {
      const updated = await db.lead.update({
        where: { id: existing.id },
        data: { ...leadData, clinicId: clinic.id, losEnquiryId: losId },
      })
      return { action: 'updated' as const, lead: updated, clinic }
    }
  }

  const created = await db.lead.create({
    data: {
      ...leadData,
      clinicId: clinic.id,
      externalId: losId ?? undefined,
    },
  })
  return { action: 'created' as const, lead: created, clinic }
}
