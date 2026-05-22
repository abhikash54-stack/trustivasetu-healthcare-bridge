'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { ADMIN_ROLES } from '@/lib/constants'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: IconDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'REGIONAL_MANAGER', 'TEAM_MEMBER'] },
  { href: '/leads', label: 'Leads', icon: IconLeads, roles: ['SUPER_ADMIN', 'ADMIN', 'REGIONAL_MANAGER', 'TEAM_MEMBER'] },
  { href: '/clinics', label: 'Clinics / Centres', icon: IconClinic, roles: ['SUPER_ADMIN', 'ADMIN', 'REGIONAL_MANAGER', 'TEAM_MEMBER'] },
  { href: '/reports', label: 'Reports', icon: IconReports, roles: ['SUPER_ADMIN', 'ADMIN', 'REGIONAL_MANAGER', 'TEAM_MEMBER'] },
  { href: '/users', label: 'User Management', icon: IconUsers, roles: ['SUPER_ADMIN', 'ADMIN'], panel: 'admin' },
  { href: '/admin/regions', label: 'Regions', icon: IconGlobe, roles: ['SUPER_ADMIN', 'ADMIN'], panel: 'admin' },
  { href: '/admin/lenders', label: 'Lenders', icon: IconBank, roles: ['SUPER_ADMIN', 'ADMIN'], panel: 'admin' },
  { href: '/admin/targets', label: 'Targets', icon: IconTarget, roles: ['SUPER_ADMIN', 'ADMIN'], panel: 'admin' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: IconAudit, roles: ['SUPER_ADMIN', 'ADMIN'], panel: 'admin' },
  { href: '/admin/webhooks', label: 'Webhook Logs', icon: IconWebhook, roles: ['SUPER_ADMIN', 'ADMIN'], panel: 'admin' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role ?? ''
  const isAdmin = ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])

  const visible = navItems.filter(item => item.roles.includes(role))
  const mainNav = visible.filter(item => item.panel !== 'admin')
  const adminNav = isAdmin ? visible.filter(item => item.panel === 'admin') : []

  const asideClass = cn(
    'fixed inset-y-0 left-0 w-64 bg-trustiva-panel flex flex-col z-50 transition-transform duration-200 border-r border-white/10',
    'lg:translate-x-0',
    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  )

  return (
    <aside className={asideClass}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-trustiva-lime rounded-lg flex items-center justify-center flex-shrink-0 text-trustiva-navy font-bold text-sm">
            T
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Trustiva Setu</p>
            <p className="text-trustiva-lime/80 text-xs">{isAdmin ? 'Admin Panel' : 'RM Panel'}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1" aria-label="Close">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <NavSection items={mainNav} pathname={pathname} onNavigate={onClose} />
        {adminNav.length > 0 && (
          <>
            <p className="px-3 mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-trustiva-muted">Administration</p>
            <NavSection items={adminNav} pathname={pathname} onNavigate={onClose} />
          </>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-trustiva-lime rounded-full flex items-center justify-center text-trustiva-navy text-sm font-semibold">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-trustiva-muted text-xs truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/lms/login' })}
          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

function NavSection({
  items,
  pathname,
  onNavigate,
}: {
  items: typeof navItems
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="space-y-1">
      {items.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              active ? 'bg-trustiva-lime text-trustiva-navy font-semibold' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function IconLeads({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconClinic({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}
function IconReports({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconBank({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  )
}
function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
function IconAudit({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}
function IconWebhook({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}
