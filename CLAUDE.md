# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Next.js on port 3000
npm run build            # prisma generate + next build
npm run db:push          # Push schema changes to DB
npm run db:seed          # Seed demo data (150+ leads, 12 clinics, 6 lenders, 6 roles)
npm run db:setup         # Embedded PostgreSQL setup (Windows-friendly, no Docker needed)
npm run db:studio        # Open Prisma Studio GUI
npm run vercel-build     # Production build: prisma generate + db push + next build
```

No test runner is configured. Playwright is installed (`@playwright/test`) but no test files exist yet.

## Architecture

**Stack**: Next.js 14 App Router · TypeScript · Prisma (PostgreSQL) · NextAuth.js 4.x · Tailwind CSS

### Directory layout

```
src/
  app/
    (app)/          # Authenticated routes — dashboard, clinics, leads, reports, users, admin, hr, expenses
    api/            # REST endpoints + NextAuth
    lms/            # Login page (public)
    login/          # Redirect shim
    terms/ privacy-policy/ disclaimer/   # Legal (public)
  components/
    dashboard/      # KPI + chart components (recharts)
    layout/         # AppShell, Sidebar, Header
    leads/ clinics/ hr/ users/ reports/  # Domain-specific UIs
    ui/             # Shared primitives: LoadingSpinner, ErrorAlert, EmptyState, Modal
  lib/
    auth.ts         # NextAuth CredentialsProvider config
    api-auth.ts     # getRequestSession(), requireSession(), requirePermission()
    permissions.ts  # RBAC helpers
    role-permissions.ts  # Permission matrix loaded from DB
    db.ts           # Prisma singleton
    tab-session.ts  # Multi-tab JWT management
    msg91.ts        # SMS/OTP gateway
    los-client.ts los-mapper.ts  # External LOS Healthcare Console sync
  middleware.ts     # Auth + RBAC enforcement on all protected routes
```

### Authentication & sessions

Two auth layers run in parallel:

1. **NextAuth cookie** (`next-auth.session-token`) — standard browser session, 8 h maxAge, JWT strategy. Token payload carries `id`, `role`, `regionIds`, `clinicIds`.
2. **Tab-specific JWT** (`TabSession` DB table) — each browser tab gets its own JWT stored in `sessionStorage`. Created by `POST /api/auth/tab-login`, invalidated by `POST /api/auth/tab-logout`. Used to support concurrent logins from different tabs.

`src/middleware.ts` checks `Authorization: Bearer <jwt>` first (tab session), then falls back to the NextAuth cookie. It passes the decoded user as a base64 JSON string in the `x-tab-user` request header.

**All API routes must call `getRequestSession(req)` from `src/lib/api-auth.ts`** — never read the NextAuth session directly. This handles both auth paths and returns a unified `SessionUser`.

### RBAC

Roles: `SUPER_ADMIN > ADMIN > REGIONAL_MANAGER > TEAM_MEMBER`

Permissions are stored in a DB table (`RolePermission`) and cached via `role-permissions.ts`. Use `requirePermission(session, 'resource:action')` in API routes to gate access. The admin permission matrix UI lives at `/admin/permissions`.

Regional scoping: `REGIONAL_MANAGER` and `TEAM_MEMBER` see only the leads/clinics/users in their assigned `regionIds`/`clinicIds`. Enforce this in every API query — check `session.regionIds` and filter accordingly.

### API route pattern

```ts
export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // optional: await requirePermission(session, 'leads:read');
  // ... Prisma query with region/clinic scoping
}
```

### Database

Prisma schema at `prisma/schema.prisma`. Key models: `User`, `Clinic`, `Lead`, `Region`, `Target`, `Attendance`, `Expense`, `TabSession`, `AuditLog`, `Notification`, `WebhookEvent`.

Every significant user action should create an `AuditLog` row (`userId`, `action`, `entity`, `entityId`, `details`).

### OTP / SMS

`src/lib/msg91.ts` calls MSG91 Flow API. In development, set `OTP_BYPASS=true` in `.env` — the bypass stores `123456` in the DB and skips the real API call. The dev hint (showing the bypass code) is shown only to `SUPER_ADMIN` users.

### Webhooks

`POST /api/webhooks/*` — verified via `x-webhook-secret` header (`process.env.WEBHOOK_SECRET`). Events are stored in `WebhookEvent` with status `RECEIVED → PROCESSED/FAILED`. Used for inbound sync from LOS Healthcare Console.

### Environment variables

Required (see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — JWT signing secret
- `NEXTAUTH_URL` — Base URL (e.g., `http://localhost:3000`)
- `MSG91_AUTH_KEY`, `MSG91_FLOW_ID` — SMS OTP
- `WEBHOOK_SECRET` — Inbound webhook verification
- Optional: `SMTP_*` for email, `LOS_API_KEY` for LOS sync, `OTP_BYPASS=true` for dev

## Key conventions

- Path alias `@/*` maps to `src/*`.
- Zod + `react-hook-form` for all form validation.
- `xlsx` package for Excel exports (leads, clinics, reports).
- `@vercel/blob` for file storage (appointment letters, etc.).
- Framer Motion for page/modal transitions.
- `react-hot-toast` for notifications.
