import { NotificationType } from '@prisma/client'
import { db } from '@/lib/db'

export async function createNotification(params: {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string
}) {
  return db.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type ?? 'INFO',
      link: params.link,
    },
  })
}

export async function notifyClinicRM(clinicId: string, params: Omit<Parameters<typeof createNotification>[0], 'userId'>) {
  const clinic = await db.clinic.findUnique({
    where: { id: clinicId },
    select: { assignedRMId: true, name: true },
  })
  if (!clinic?.assignedRMId) return null
  return createNotification({ userId: clinic.assignedRMId, ...params })
}

export async function notifyAdmins(params: Omit<Parameters<typeof createNotification>[0], 'userId'>) {
  const admins = await db.user.findMany({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] }, isActive: true },
    select: { id: true },
  })
  return Promise.all(admins.map(a => createNotification({ userId: a.id, ...params })))
}
