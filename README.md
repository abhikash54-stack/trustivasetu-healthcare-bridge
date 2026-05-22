# Trustiva Setu — Lead Management System

Production-ready LMS for Trustiva: clinic onboarding, lead tracking, lender-wise approvals, region-scoped dashboards, and real-time webhook sync.

## Features

| Area | Capability |
|------|------------|
| **Auth** | NextAuth credentials, JWT sessions, audit on login |
| **RBAC** | Super Admin, Admin, Regional Manager, Team Member |
| **Visibility** | Region- and clinic-scoped data per role |
| **Dashboard** | KPIs, 6-month trends, lender chart, targets & run rate |
| **Clinics** | Onboarding, RM assignment, MTD/LMTD stats, Excel export |
| **Leads** | CRUD, status workflow, search & filters, export |
| **Reports** | Monthly, region, RM, **lender approval** reports |
| **Admin** | Users, regions, lenders, targets, audit logs, webhook logs |
| **Notifications** | In-app bell, auto-alerts on lead status change |
| **Lead detail** | `/leads/[id]` full applicant & clinic view |
| **Webhooks** | `lead.*`, `clinic.*`, `user.*` sync with event logging |
| **Database** | PostgreSQL + Prisma migrations |

## Tech stack

- Next.js 14 (App Router)
- NextAuth.js
- Prisma + PostgreSQL
- Tailwind CSS
- Recharts
- xlsx (Excel export)
- Deploy target: **Vercel**

## Quick start (local)

### Option A — Embedded PostgreSQL (no Docker, recommended on Windows)

From the project folder:

```powershell
cd c:\trustiva-lms
npm install
npm run db:setup
```

This starts a local Postgres on port **5432**, runs migrations, and seeds demo users. The DB keeps running in the background.

### Option B — Docker

1. Start **Docker Desktop** (Running).
2. `docker compose up -d` then `npx prisma migrate deploy` and `npm run db:seed`.

### Option C — Cloud PostgreSQL (Neon, Supabase, etc.)

Set `DATABASE_URL` in `.env` to your provider’s connection string (must start with `postgresql://`), then:

```bash
npx prisma migrate deploy
npm run db:seed
```

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@trustivasetu.com | Admin@123 |
| Admin | ops@trustivasetu.com | Admin@123 |
| Regional Manager (North) | rm.north@trustivasetu.com | Rm@123456 |
| Regional Manager (South) | rm.south@trustivasetu.com | Rm@123456 |
| Regional Manager (West) | rm.west@trustivasetu.com | Rm@123456 |
| Team Member | team.north@trustivasetu.com | Team@123456 |

Seed creates **150+ leads** (6 months), **12 clinics**, **6 lenders**, sample **notifications**, **audit logs**, and **webhook events**.

## Project structure

```
src/
  app/
    (app)/          # Authenticated app (dashboard, leads, clinics, reports, admin)
    api/            # REST APIs + NextAuth + webhooks
    login/
  components/
    dashboard/      # Charts & metrics
    layout/         # AppShell, Sidebar, Header
    leads/ clinics/ # Domain UI
    ui/             # LoadingSpinner, ErrorAlert, EmptyState
  lib/
    auth.ts         # NextAuth config
    permissions.ts  # RBAC helpers
    api-auth.ts     # API session guards
    webhooks.ts     # Webhook verify + logging
    db.ts           # Prisma singleton
prisma/
  schema.prisma
  migrations/
  seed.ts
```

## Roles & panels

- **Admin panel** (`SUPER_ADMIN`, `ADMIN`): full data, user/region/lender management.
- **RM panel** (`REGIONAL_MANAGER`, `TEAM_MEMBER`): region- or clinic-scoped dashboard, leads, clinics, reports.

Protected routes are enforced in `src/middleware.ts`.

## Webhook APIs

Send `POST` with header `x-webhook-secret: <WEBHOOK_SECRET>`.

| Endpoint | Events |
|----------|--------|
| `/api/webhooks/leads` | `lead.created`, `lead.updated` |
| `/api/webhooks/clinics` | `clinic.created`, `clinic.updated` |
| `/api/webhooks/users` | `user.created`, `user.deactivated` |

Example lead payload:

```json
{
  "event": "lead.created",
  "data": {
    "externalId": "EXT-001",
    "applicantName": "John Doe",
    "amount": 5.5,
    "status": "PENDING",
    "clinicExternalId": "CLI001",
    "lenderCode": "HDFC"
  }
}
```

Events are stored in `WebhookEvent` for audit and debugging.

## Deploy (production)

**URL:** [https://analytics.trustivasetu.com](https://analytics.trustivasetu.com)

Full steps: **[docs/DEPLOY.md](docs/DEPLOY.md)** — Neon DB, Vercel env vars, DNS CNAME `analytics` → `cname.vercel-dns.com`, `vercel --prod`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

## License

Private — Trustiva.
