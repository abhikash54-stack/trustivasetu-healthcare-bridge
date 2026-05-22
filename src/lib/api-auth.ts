import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { hasPermission, type Permission } from '@/lib/permissions'

export type SessionUser = {
  id: string
  email: string
  name: string
  role: string
  regionIds: string[]
  clinicIds: string[]
}

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { session: null, user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const user = session.user as SessionUser
  return { session, user, error: null }
}

export async function requirePermission(permission: Permission) {
  const result = await requireSession()
  if (result.error) return result
  if (!hasPermission(result.user!.role, permission)) {
    return { ...result, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return result
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status })
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}
