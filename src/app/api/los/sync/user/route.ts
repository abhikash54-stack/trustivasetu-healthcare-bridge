import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { losUnauthorized, verifyLosRequest } from '@/lib/los-auth'
import { mapLosRole } from '@/lib/los-mapper'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  if (!verifyLosRequest(req)) return losUnauthorized()

  const body = await req.json() as Record<string, unknown>
  const email = String(body.email ?? '').toLowerCase().trim()
  const name = String(body.fullName ?? body.name ?? '')
  const password = String(body.password ?? '')
  const phone = body.phone ? String(body.phone) : null
  const roleLabel = String(body.role ?? body.userType ?? 'Relationship Associate')

  if (!email.endsWith('@trustivasetu.com')) {
    return NextResponse.json({ error: 'Only @trustivasetu.com emails allowed' }, { status: 400 })
  }
  if (!name || !password) {
    return NextResponse.json({ error: 'Name and password required' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)
  const role = mapLosRole(roleLabel)

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    const updateData: { name: string; phone: string | null; role: typeof role; isActive: boolean; password?: string } = {
      name,
      phone,
      role,
      isActive: body.isActive !== false,
    }
    if (password.length >= 6) updateData.password = await bcrypt.hash(password, 12)

    const user = await db.user.update({ where: { id: existing.id }, data: updateData })

    const regionName = String(body.region ?? '')
    if (regionName) {
      const region = await db.region.findFirst({
        where: { name: { contains: regionName.split(' ')[0], mode: 'insensitive' } },
      })
      if (region) {
        await db.userRegion.upsert({
          where: { userId_regionId: { userId: user.id, regionId: region.id } },
          update: {},
          create: { userId: user.id, regionId: region.id },
        })
      }
    }

    await db.auditLog.create({
      data: { action: 'UPDATE', entity: 'User', entityId: user.id, details: JSON.stringify({ source: 'los', role: roleLabel }) },
    })

    return NextResponse.json({ success: true, action: 'updated', userId: user.id })
  }

  const user = await db.user.create({
    data: { email, name, password: hash, phone, role },
  })

  const regionName = String(body.region ?? '')
  if (regionName) {
    const region = await db.region.findFirst({
      where: { name: { contains: regionName.split(' ')[0], mode: 'insensitive' } },
    })
    if (region) {
      await db.userRegion.upsert({
        where: { userId_regionId: { userId: user.id, regionId: region.id } },
        update: {},
        create: { userId: user.id, regionId: region.id },
      })
    }
  }

  await db.auditLog.create({
    data: { action: 'CREATE', entity: 'User', entityId: user.id, details: JSON.stringify({ source: 'los', role: roleLabel }) },
  })

  return NextResponse.json({ success: true, action: 'created', userId: user.id })
}
