import { LeadStatus, Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { resolveClinicByHospitalName, syncLosEnquiry } from '@/lib/los-mapper'

export type LosActivityType =
  | 'lead'
  | 'credit'
  | 'collection'
  | 'lender'
  | 'payment'
  | 'target'
  | 'attendance'
  | 'visit'
  | 'enquiry'
  | 'operations'
  | 'hospital'

async function findLead(payload: Record<string, unknown>) {
  const losEnquiryId = payload.losEnquiryId ? String(payload.losEnquiryId) : null
  if (losEnquiryId) {
    const lead = await db.lead.findUnique({ where: { losEnquiryId } })
    if (lead) return lead
  }
  const mobile = payload.mobileNumber ? String(payload.mobileNumber) : null
  const patient = payload.patientName ? String(payload.patientName) : null
  if (mobile && patient) {
    const id = `LOS-${mobile}-${patient.replace(/\s/g, '')}`
    return db.lead.findUnique({ where: { losEnquiryId: id } })
  }
  return null
}

function appendActivity(meta: Record<string, unknown> | null, entry: Record<string, unknown>) {
  const prev = (meta?.losActivities as unknown[] | undefined) ?? []
  return {
    ...(meta ?? {}),
    losActivities: [...prev, { ...entry, at: new Date().toISOString() }],
    lastLosSync: new Date().toISOString(),
    source: 'los',
  }
}

/** Generic LOS tab → LMS data for reports */
export async function syncLosActivity(payload: Record<string, unknown>) {
  const activityType = String(payload.activityType ?? 'operations') as LosActivityType
  const hospitalName = String(payload.hospitalName ?? '').trim()

  if (activityType === 'lead' || activityType === 'enquiry') {
    return syncLosEnquiry(payload)
  }

  if (activityType === 'hospital' || activityType === 'payment' || activityType === 'visit') {
    if (!hospitalName) throw new Error('hospitalName required')
    const clinic = await resolveClinicByHospitalName(hospitalName)
    if (!clinic) throw new Error(`Hospital not found: ${hospitalName}`)
    const metadata = appendActivity(clinic.metadata as Record<string, unknown> | null, {
      activityType,
      ...payload,
    }) as Prisma.InputJsonValue
    const updated = await db.clinic.update({ where: { id: clinic.id }, data: { metadata } })
    return { action: 'updated' as const, entity: 'clinic' as const, clinicId: updated.id }
  }

  if (activityType === 'attendance' || activityType === 'target') {
    await db.auditLog.create({
      data: {
        action: 'LOS_SYNC',
        entity: 'LosActivity',
        details: JSON.stringify({ activityType, menu: payload.menu, ...payload }),
      },
    })
    if (hospitalName) {
      const clinic = await resolveClinicByHospitalName(hospitalName)
      if (clinic) {
        const metadata = appendActivity(clinic.metadata as Record<string, unknown> | null, {
          activityType,
          ...payload,
        }) as Prisma.InputJsonValue
        await db.clinic.update({ where: { id: clinic.id }, data: { metadata } })
        return { action: 'updated' as const, entity: 'clinic' as const, clinicId: clinic.id }
      }
    }
    return { action: 'logged' as const, entity: 'audit' as const }
  }

  let lead = await findLead(payload)
  if (!lead && hospitalName && (payload.patientName || payload.applicantName)) {
    const result = await syncLosEnquiry({
      ...payload,
      hospitalName,
      status: payload.status ?? 'PENDING',
    })
    lead = result.lead
  }
  if (!lead) {
    throw new Error('Lead not found — create enquiry first or provide mobile + patient name')
  }

  const meta = appendActivity(lead.metadata as Record<string, unknown> | null, {
    activityType,
    menu: payload.menu,
    ...payload,
  })

  const update: Prisma.LeadUpdateInput = { metadata: meta as Prisma.InputJsonValue }

  if (activityType === 'credit') {
    const status = String(payload.creditStatus ?? payload.status ?? '').toUpperCase()
    if (status === 'APPROVED' || status === 'REJECTED' || status === 'DISBURSED' || status === 'PENDING') {
      update.status = status as LeadStatus
    }
    if (payload.approvedAmount != null) update.approvedAmount = Number(payload.approvedAmount)
    if (payload.deviationReason) {
      update.remarks = String(payload.deviationReason)
    }
  }

  if (activityType === 'collection') {
    const collected = Number(payload.collectedAmount ?? payload.amount ?? 0)
    if (collected > 0) {
      update.disbursedAmount = collected
      update.status = LeadStatus.DISBURSED
      if (payload.collectionDate) update.disbursalDate = new Date(String(payload.collectionDate))
    }
  }

  if (activityType === 'lender') {
    const lenderCode = String(payload.lenderCode ?? payload.lender ?? '').toUpperCase()
    const lender = await db.lender.findFirst({
      where: {
        OR: [
          { code: { contains: lenderCode, mode: 'insensitive' } },
          { name: { contains: lenderCode, mode: 'insensitive' } },
        ],
      },
    })
    if (lender) update.lender = { connect: { id: lender.id } }
    if (payload.lenderStatus === 'APPROVED') {
      update.status = LeadStatus.APPROVED
      if (payload.approvedAmount != null) update.approvedAmount = Number(payload.approvedAmount)
    }
  }

  const updated = await db.lead.update({ where: { id: lead.id }, data: update })

  await db.auditLog.create({
    data: {
      action: 'UPDATE',
      entity: 'Lead',
      entityId: updated.id,
      details: JSON.stringify({ source: 'los', activityType, menu: payload.menu }),
    },
  })

  return { action: 'updated' as const, entity: 'lead' as const, leadId: updated.id, clinicId: updated.clinicId }
}
