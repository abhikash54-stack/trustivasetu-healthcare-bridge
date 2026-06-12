# Trustiva LMS Audit

## Overview

This audit documents the reference LMS project at `C:\Users\abhik\Desktop\trustiva-lms-project` and captures the architecture, data model, auth/permission model, LOS sync integration, and primary business workflows.

The LMS is built with:
- Next.js App Router (`src/app`)
- Prisma + PostgreSQL (`prisma/schema.prisma`)
- NextAuth credentials provider (`src/lib/auth.ts`)
- Role-based access control (`src/lib/permissions.ts`)
- Synchronization endpoints for LOS data (`src/app/api/los/*`, `src/lib/los-*`)
- Reporting/dashboard APIs and Excel export functionality

> The LMS project is treated as read-only. No changes were made to `trustiva-lms-project`.

## Key Subsystems

### Authentication

- Uses `next-auth` with credentials provider.
- Validates users against the Prisma `User` table.
- Session JWT includes `id`, `role`, `regionIds`, and `clinicIds` for access filtering.
- Sign-in pages: `src/app/login/page.tsx` and `src/app/lms/login/page.tsx`.

### Authorization and Scope

- Permissions are defined in `src/lib/permissions.ts`.
- Core roles:
  - `SUPER_ADMIN`
  - `ADMIN`
  - `REGIONAL_MANAGER`
  - `TEAM_MEMBER`
- Role permissions cover: lead create/read/update/delete, clinic create/read/update/delete, user management, dashboard, report export, audit log view, target management, lender management.
- Data visibility uses `buildClinicFilter(role, regionIds, clinicIds)` to constrain access to clinics/leads.

### Core Domain Models

The LMS data model is defined in `prisma/schema.prisma` and includes:
- `User`
- `Region`
- `Clinic`
- `Lender`
- `Lead`
- `Target`
- `AuditLog`
- `Notification`
- `WebhookEvent`

These models power the CRM/LOS business flows and reporting.

### LOS Integration

A key piece of the training app is the LOS simulator and synchronization bridge:
- `src/lib/los-client.ts`: LOS API client for sync communication.
- `src/lib/los-mapper.ts`: maps LOS enquiry payloads to LMS lead records and resolves clinics.
- `src/lib/los-activity.ts`: generic LOS activity sync for lead, credit, collection, lender, payment, target, attendance, visit, hospital operations.
- `src/lib/los-menus.ts`: menu metadata for LOS actions and field templates.
- `src/lib/los/sync-to-lms.ts`: sends LOS leads into LMS sync endpoint.
- UI module: `src/components/los` implements a LOS-style sidebar and action pages.

### Webhooks and Audit

- `src/lib/webhooks.ts`: common webhook event handling and logging.
- Webhook endpoints (`src/app/api/webhooks/*`) accept external events and persist `WebhookEvent` records.
- Export route `src/app/api/export/route.ts` supports Excel exports for leads, clinics, lenders, dashboard reports.

### Reporting and Dashboard

- Dashboard metrics are calculated in `src/app/api/dashboard/route.ts`.
- Metrics include total leads, approved/disbursed counts, approval/disbursal rates, lender-wise stats, monthly trends, and target run rates.
- Activity feed and pending lead counts are served via `src/app/api/activity/route.ts`.

## Frontend Structure

The LMS UI lives under `src/app/(app)` and includes pages for:
- `dashboard`
- `clinics`
- `leads`
- `users`
- `admin` (regions, targets, lenders, audit logs, webhooks)
- `reports`
- partner pages under `src/app/partner`

There is also a LOS-style console under `src/components/los` and `src/lib/los` for offline/local mock entry.

## Business Focus

The reference LMS primarily supports:
- Healthcare lead management
- Clinic onboarding and RM assignment
- Target management for associates and clinics
- Lead status tracking to approval/disbursement
- Lender and collection reporting
- LOS data ingestion through structured LOS menu actions

## Integration Implications for Mobile

The mobile bridge should align with the LMS domain by:
- Authenticating users against the same `User` roles and guard rails
- Mapping clinic/hospital onboarding flows to clinic sync endpoints
- Mapping patient enquiry creation to LMS lead creation/sync
- Presenting dashboard metrics that mirror LMS reports
- Supporting LOS sync activities for lead updates, credit decisions, collections, attendance, and payments
- Respecting role-based visibility for regions and clinics
