import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { hasPermission } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'REGIONAL_MANAGER', 'TEAM_MEMBER']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
  regionIds: z.array(z.string()).optional(),
  clinicIds: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(session.user.role, 'USER_READ') && session.user.id !== params.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const user = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, email: true, name: true, role: true, isActive: true, phone: true, createdAt: true,
      regionAssignments: { include: { region: true } },
      clinicAssignments: { include: { clinic: { select: { id: true, name: true } } } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ data: user })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(session.user.role, 'USER_UPDATE')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  const { regionIds, clinicIds, password, ...rest } = parsed.data
  const updateData: Record<string, unknown> = { ...rest }
  if (password) updateData.password = await bcrypt.hash(password, 12)

  if (regionIds !== undefined) {
    await db.userRegion.deleteMany({ where: { userId: params.id } })
    if (regionIds.length) {
      await db.userRegion.createMany({ data: regionIds.map(rid => ({ userId: params.id, regionId: rid })) })
    }
  }
  if (clinicIds !== undefined) {
    await db.userClinic.deleteMany({ where: { userId: params.id } })
    if (clinicIds.length) {
      await db.userClinic.createMany({ data: clinicIds.map(cid => ({ userId: params.id, clinicId: cid })) })
    }
  }

  const user = await db.user.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, isActive: true },
  })

  await db.auditLog.create({ data: { userId: session.user.id, action: 'UPDATE', entity: 'User', entityId: params.id } })
  return NextResponse.json({ data: user })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(session.user.role, 'USER_DELETE')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (params.id === session.user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

  await db.user.update({ where: { id: params.id }, data: { isActive: false } })
  await db.auditLog.create({ data: { userId: session.user.id, action: 'DEACTIVATE', entity: 'User', entityId: params.id } })
  return NextResponse.json({ success: true })
}
