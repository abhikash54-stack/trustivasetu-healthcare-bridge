import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { hasPermission, type Permission } from '@/lib/permissions'
import { headers } from 'next/headers'
import { verifyTabToken } from '@/lib/tab-session'

export type SessionUser = {
  id: string
  email: string
  name: string
  role: string
  regionIds: string[]
  clinicIds: string[]
}

/**
 * Reads the current user from either:
 * 1. Authorization: Bearer <jwt> header — validated directly against the JWT secret.
 *    This is the primary path for all tab-session API calls. API routes are not in
 *    the middleware matcher, so we validate the token here rather than relying on
 *    middleware to set x-tab-user.
 * 2. x-tab-user header — set by middleware for page-route requests that carry a Bearer token.
 * 3. NextAuth cookie session — fallback for page navigation and legacy flows.
 */
export async function getRequestSession(): Promise<{ user: SessionUser } | null> {
  const headersList = await headers()

  // 1. Direct Bearer token validation (primary path for API calls from browser tabs)
  const authHeader = headersList.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const payload = await verifyTabToken(token)
    if (payload) {
      return { user: payload as SessionUser }
    }
  }

  // 2. x-tab-user header set by middleware (page-route requests with Bearer token)
  const tabUserHeader = headersList.get('x-tab-user')
  if (tabUserHeader) {
    try {
      const userData = JSON.parse(Buffer.from(tabUserHeader, 'base64').toString('utf-8'))
      if (userData?.id && userData?.role) {
        return { user: userData as SessionUser }
      }
    } catch {
      // corrupted header — fall through
    }
  }

  // 3. NextAuth cookie session (page navigation / legacy)
  return getServerSession(authOptions) as Promise<{ user: SessionUser } | null>
}

export async function requireSession() {
  const session = await getRequestSession()
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
