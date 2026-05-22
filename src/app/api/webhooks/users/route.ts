import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/db'
import { handleWebhookRequest } from '@/lib/webhooks'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  return handleWebhookRequest(req as import('next/server').NextRequest, 'USER', async ({ event, data }) => {
    if (event === 'user.created') {
      const d = data as Record<string, unknown>
      const email = String(d.email ?? '').toLowerCase()

      if (!email.endsWith('@trustivasetu.com')) {
        return NextResponse.json({ error: 'Only @trustivasetu.com emails allowed' }, { status: 400 })
      }

      const existing = await db.user.findUnique({ where: { email } })
      if (existing) return NextResponse.json({ success: true, action: 'already_exists', id: existing.id })

      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
      const hash = await bcrypt.hash(tempPassword, 12)

      const user = await db.user.create({
        data: {
          email,
          password: hash,
          name: String(d.name ?? email.split('@')[0]),
          role: (String(d.role ?? 'TEAM_MEMBER') as UserRole),
          phone: d.phone ? String(d.phone) : null,
        },
      })

      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Trustiva LMS',
          message: `Your account has been created. Temporary password: ${tempPassword}`,
          type: 'INFO',
        },
      })

      return NextResponse.json({ success: true, action: 'created', id: user.id, tempPassword })
    }

    if (event === 'user.deactivated') {
      const d = data as Record<string, unknown>
      const email = String(d.email ?? '').toLowerCase()
      const user = await db.user.findUnique({ where: { email } })
      if (user) await db.user.update({ where: { id: user.id }, data: { isActive: false } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true, event, ignored: true })
  })
}
