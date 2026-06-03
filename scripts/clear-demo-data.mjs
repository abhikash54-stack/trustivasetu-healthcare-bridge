/**
 * Deletes all demo/seed data: leads, clinics, lenders, non-admin users.
 * Keeps regions, admin accounts, and system config.
 */
import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const db = new PrismaClient()

const KEEP_EMAILS = [
  'admin@trustivasetu.com',
  'info@trustivasetu.com',
]

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer) })
  })
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║   TRUSTIVA LMS — DEMO DATA CLEANER               ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  console.log('This will permanently DELETE:')
  console.log('  • All leads')
  console.log('  • All clinics / hospitals')
  console.log('  • All lenders')
  console.log('  • All users except admin accounts')
  console.log('  • All audit logs, notifications, webhook events, targets\n')
  console.log('This will KEEP:')
  console.log('  • Regions (geography config)')
  console.log('  • Admin accounts:', KEEP_EMAILS.join(', '))
  console.log('  • Role permissions, scheme templates\n')

  // Show current counts before deletion
  const [leads, clinics, lenders, users, auditLogs, notifications, webhooks, targets] =
    await Promise.all([
      db.lead.count(),
      db.clinic.count(),
      db.lender.count(),
      db.user.count({ where: { email: { notIn: KEEP_EMAILS } } }),
      db.auditLog.count(),
      db.notification.count(),
      db.webhookEvent.count(),
      db.target.count(),
    ])

  console.log('Current record counts:')
  console.log(`  Leads:              ${leads}`)
  console.log(`  Clinics:            ${clinics}`)
  console.log(`  Lenders:            ${lenders}`)
  console.log(`  Non-admin users:    ${users}`)
  console.log(`  Audit log entries:  ${auditLogs}`)
  console.log(`  Notifications:      ${notifications}`)
  console.log(`  Webhook events:     ${webhooks}`)
  console.log(`  Targets:            ${targets}`)
  console.log('')

  if (leads + clinics + lenders + users === 0) {
    console.log('Nothing to delete — database is already empty.\n')
    return
  }

  const answer = await prompt('Type  DELETE  to confirm deletion (anything else aborts): ')
  if (answer.trim() !== 'DELETE') {
    console.log('\nAborted — nothing was deleted.\n')
    return
  }

  console.log('\nDeleting...')

  // Delete in dependency order
  await db.$transaction([
    db.tabSession.deleteMany(),
    db.notification.deleteMany(),
    db.webhookEvent.deleteMany(),
    db.auditLog.deleteMany(),
    db.lead.deleteMany(),
    db.target.deleteMany(),
    db.userClinic.deleteMany(),
    db.clinic.updateMany({ data: { assignedRMId: null } }),
    db.userRegion.deleteMany(),
  ])

  await db.user.deleteMany({ where: { email: { notIn: KEEP_EMAILS } } })
  await db.clinic.deleteMany()
  await db.lender.deleteMany()

  console.log('\nDeleted:')
  console.log(`  ${leads} lead(s)`)
  console.log(`  ${clinics} clinic(s)`)
  console.log(`  ${lenders} lender(s)`)
  console.log(`  ${users} non-admin user(s)`)
  console.log(`  ${auditLogs} audit log entries`)
  console.log(`  ${notifications} notifications`)
  console.log(`  ${webhooks} webhook events`)
  console.log(`  ${targets} target(s)`)
  console.log('\nDone. The LMS is now empty — ready for real production data.\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
