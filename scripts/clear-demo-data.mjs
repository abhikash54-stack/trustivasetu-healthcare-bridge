/**
 * Removes all demo hospitals, leads, and users. Keeps regions, lenders, super admin.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const KEEP_EMAIL = 'admin@trustivasetu.com'

async function main() {
  console.log('Clearing demo / synced transactional data...\n')

  const [n1, n2, n3, n4, n5, n6, n7, n8] = await db.$transaction([
    db.notification.deleteMany(),
    db.webhookEvent.deleteMany(),
    db.auditLog.deleteMany(),
    db.lead.deleteMany(),
    db.target.deleteMany(),
    db.userClinic.deleteMany(),
    db.clinic.updateMany({ data: { assignedRMId: null } }),
    db.userRegion.deleteMany(),
  ])

  const deletedUsers = await db.user.deleteMany({
    where: { email: { not: KEEP_EMAIL } },
  })
  const deletedClinics = await db.clinic.deleteMany()

  console.log(`Notifications: ${n1.count}`)
  console.log(`Webhook events: ${n2.count}`)
  console.log(`Audit logs: ${n3.count}`)
  console.log(`Leads: ${n4.count}`)
  console.log(`Targets: ${n5.count}`)
  console.log(`User–clinic links: ${n6.count}`)
  console.log(`Users (except admin): ${deletedUsers.count}`)
  console.log(`Hospitals/clinics: ${deletedClinics.count}`)
  console.log('\nDone. LMS is empty — data will come from LOS sync only.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
