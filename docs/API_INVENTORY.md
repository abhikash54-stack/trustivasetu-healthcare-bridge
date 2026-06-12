# API Inventory

This inventory summarizes the primary LMS API endpoints discovered in `trustiva-lms-project`.

## Authentication

- `POST /api/auth/[...nextauth]`
  - NextAuth credentials authentication.
  - Login with `email` and `password`.

## Leads

- `GET /api/leads`
  - Query parameters: `clinicId`, `regionId`, `lenderId`, `status`, `search`, `dateFrom`, `dateTo`, `page`, `pageSize`.
  - Returns paginated leads with clinic, lender, and creator metadata.

- `POST /api/leads`
  - Creates a new lead.
  - Required payload: `applicantName`, `amount`, `clinicId`.
  - Optional payload: `phone`, `email`, `lenderId`, `applicationDate`, `remarks`, `externalId`.
  - Authorization: `LEAD_CREATE` permission.

- `GET /api/leads/[id]`
  - Fetch a single lead by ID.
  - Returns clinic, lender, and createdBy user info.

- `PATCH /api/leads/[id]`
  - Updates lead fields and status.
  - Supported fields: `applicantName`, `phone`, `amount`, `status`, `approvedAmount`, `disbursedAmount`, `lenderId`, `approvalDate`, `disbursalDate`, `remarks`.
  - Authorization: `LEAD_UPDATE` permission.

- `DELETE /api/leads/[id]`
  - Deletes a lead.
  - Authorization: `LEAD_DELETE` permission.

## Clinics

- `GET /api/clinics`
  - Query parameters: `minimal`, `search`, `regionId`, `page`, `pageSize`.
  - Returns either minimal clinic list or paginated clinics with stats.

- `POST /api/clinics`
  - Creates a new clinic.
  - Required payload: `name`, `address`, `contactPerson`, `contactNumber`, `regionId`.
  - Optional payload: `accountNumber`, `email`, `businessPotential`, `assignedRMId`, `externalId`.
  - Authorization: `CLINIC_CREATE` permission.

- `GET /api/clinics/[id]`
  - Fetch details for clinic and current month targets.

- `PATCH /api/clinics/[id]`
  - Update clinic metadata and assigned RM.
  - Authorization: `CLINIC_UPDATE` permission.

- `DELETE /api/clinics/[id]`
  - Soft-deactivates a clinic.
  - Authorization: `CLINIC_DELETE` permission.

## Dashboard / Reporting

- `GET /api/dashboard`
  - Query parameters: `regionId`, `clinicId`, `lenderId`, `rmId`, `dateFrom`, `dateTo`.
  - Returns metrics: total leads, approved/disbursed counts, clinic counts, values, approval/disbursal rates, lender-wise stats, monthly trend, target run rates.

- `GET /api/activity`
  - Returns user-specific recent leads, pending lead count, and audit feed.

- `GET /api/export`
  - Query parameter `type`: `leads`, `clinics`, `lender`, `dashboard`, `report`.
  - Exports Excel files for leads, clinics, lender approvals, or monthly reports.

## Regions

- `GET /api/regions`
  - Returns active regions.

- `POST /api/regions`
  - Creates a region.
  - Required payload: `name`, `code`.
  - Authorization: `SUPER_ADMIN` or `ADMIN`.

## Targets

- `GET /api/targets`
  - Optional `year`, `month` query parameters.
  - Returns target records with region/user/clinic relations.

- `POST /api/targets`
  - Creates or updates a monthly target.
  - Required payload: `year`, `month`, `leadsTarget`, `disbursalTarget`.
  - Optional payload: `userId`, `regionId`, `clinicId`.
  - Authorization: `SUPER_ADMIN` or `ADMIN`.

## Users

- `GET /api/users`
  - Returns users with optional `minimal` or `role` and `search` filters.

- `POST /api/users`
  - Creates a new user.
  - Required payload: `email`, `password`, `name`, `role`.
  - Optional payload: `phone`, `regionIds`, `clinicIds`.
  - Authorization: `USER_CREATE` permission.

- `PATCH /api/users/[id]`
  - Updates user status or profile fields.
  - Authorization: `USER_UPDATE` permission.

## Notifications

- `GET /api/notifications`
  - Fetches current user notifications.

- `PATCH /api/notifications`
  - Marks a notification or all notifications as read.

## Webhooks / LOS Sync

### General LMS webhook handlers

- `POST /api/webhooks/leads`
  - Handles `lead.created` / `lead.updated` events.
  - Maps external payload to LMS lead records based on clinic external ID or lender code.

- `POST /api/webhooks/users`
  - Handles `user.created` / `user.deactivated` events.
  - Creates or deactivates LMS users.

- `POST /api/webhooks/events`
  - General webhook event ingestion and logging.

### LOS-specific sync endpoints

- `POST /api/los/db`
  - Reads/writes in-memory or persisted LOS mock database.

- `POST /api/los/sync/enquiry`
  - Syncs a lead enquiry from LOS into LMS.
  - Creates or updates leads based on `losEnquiryId` and hospital lookup.

- `POST /api/los/sync/clinic`
  - Syncs clinic/hospital data from LOS.
  - Creates or updates clinics and region assignments.

- `POST /api/los/sync/commercial`
  - Syncs hospital commercial/terms metadata into clinic metadata.

- `POST /api/los/sync/user`
  - Syncs TURN user records from LOS into LMS.

- `POST /api/los/sync/activity`
  - Syncs generic LOS activity data for lead, credit, collection, lender, target, attendance, visit, payment, and hospital metadata.

## External Integration Patterns

- `src/lib/los-auth.ts` secures LOS sync endpoints with `x-los-api-key` or `x-webhook-secret`.
- LOS syncs are mapped through `src/lib/los-mapper.ts` and `src/lib/los-activity.ts` into clinical leads, clinics, and metadata updates.
