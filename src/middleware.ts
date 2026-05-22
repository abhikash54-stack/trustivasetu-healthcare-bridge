import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const
const ADMIN_ONLY_PREFIXES = ['/users', '/admin']

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const role = token?.role as string | undefined
    const { pathname } = req.nextUrl

    const isAdminRoute = ADMIN_ONLY_PREFIXES.some(
      prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )

    if (isAdminRoute && role && !ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clinics/:path*',
    '/leads/:path*',
    '/reports/:path*',
    '/users/:path*',
    '/admin/:path*',
  ],
}
