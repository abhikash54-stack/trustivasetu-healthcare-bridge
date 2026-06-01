import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createNotification, notifyAdmins } from '@/lib/notify'
import { sendEmail } from '@/lib/email'

const schema = z.object({
  clinicId: z.string().min(1),
  applicantName: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email().optional().or(z.literal('')),
  amount: z.number().positive(),
  treatmentName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  employmentType: z.string().optional(),
  monthlyIncome: z.number().optional(),
  existingEMI: z.number().optional(),
  panNumber: z.string().optional(),
  aadhaarLast4: z.string().optional(),
  source: z.enum(['QR', 'CHATBOT']).default('QR'),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const d = parsed.data

  const clinic = await db.clinic.findFirst({
    where: { isActive: true, OR: [{ externalId: d.clinicId }, { id: d.clinicId }] },
    include: { assignedRM: { select: { id: true, name: true, email: true } } },
  })
  if (!clinic) return NextResponse.json({ error: 'Invalid clinic ID' }, { status: 404 })

  const metadata: Record<string, string | number | boolean> = {
    source: d.source,
    submittedAt: new Date().toISOString(),
    publicSubmission: true,
  }
  if (d.dateOfBirth) metadata.dateOfBirth = d.dateOfBirth
  if (d.employmentType) metadata.employmentType = d.employmentType
  if (d.monthlyIncome) metadata.monthlyIncome = d.monthlyIncome
  if (d.existingEMI) metadata.existingEMI = d.existingEMI
  if (d.panNumber) metadata.panNumber = d.panNumber
  if (d.aadhaarLast4) metadata.aadhaarLast4 = d.aadhaarLast4

  // Prevent duplicate submissions: same phone at same clinic within 24 hours
  const recentDuplicate = await db.lead.findFirst({
    where: {
      clinicId: clinic.id,
      phone: d.phone,
      status: { not: 'CANCELLED' },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (recentDuplicate) {
    return NextResponse.json({
      success: true,
      leadId: recentDuplicate.id,
      referenceId: `TS-${recentDuplicate.id.slice(-8).toUpperCase()}`,
    }, { status: 200 })
  }

  const lead = await db.lead.create({
    data: {
      applicantName: d.applicantName,
      phone: d.phone,
      email: d.email || null,
      amount: d.amount,
      clinicId: clinic.id,
      treatmentName: d.treatmentName || null,
      treatmentCategory: d.treatmentName || null,
      status: 'PENDING',
      metadata,
    },
  })

  const refId = `TS-${lead.id.slice(-8).toUpperCase()}`
  const source = d.source === 'CHATBOT' ? 'Chatbot' : 'QR Code'

  const notifMsg = `${d.applicantName} applied from ${clinic.name} via ${source}. ₹${d.amount.toLocaleString('en-IN')} | Ref: ${refId}`
  const leadLink = `/leads/${lead.id}`

  // Notify assigned RM
  if (clinic.assignedRM) {
    await createNotification({
      userId: clinic.assignedRM.id,
      title: `New Lead via ${source} — ${clinic.name}`,
      message: notifMsg,
      type: 'SUCCESS',
      link: leadLink,
    })
    if (clinic.assignedRM.email) {
      await sendEmail({
        to: clinic.assignedRM.email,
        subject: `New Lead: ${d.applicantName} — ${clinic.name}`,
        html: `<div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#07111f;">New Lead via ${source}</h2>
          <p><strong>Applicant:</strong> ${d.applicantName}</p>
          <p><strong>Phone:</strong> +91 ${d.phone}</p>
          <p><strong>Clinic:</strong> ${clinic.name}</p>
          <p><strong>Loan Amount:</strong> ₹${d.amount.toLocaleString('en-IN')}</p>
          ${d.treatmentName ? `<p><strong>Purpose:</strong> ${d.treatmentName}</p>` : ''}
          <p><strong>Reference ID:</strong> ${refId}</p>
          <p style="margin-top:16px;"><a href="${process.env.NEXTAUTH_URL ?? 'https://lms.trustivasetu.com'}/leads/${lead.id}" style="background:#bef264;color:#07111f;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">View Lead</a></p>
        </div>`,
      })
    }
  }

  await notifyAdmins({
    title: `New Public Lead — ${clinic.name}`,
    message: notifMsg,
    type: 'INFO',
    link: leadLink,
  })

  await db.auditLog.create({
    data: { action: 'CREATE', entity: 'Lead', entityId: lead.id, details: `Public submission via ${source}` },
  })

  return NextResponse.json({ success: true, leadId: lead.id, referenceId: refId }, { status: 201 })
}
