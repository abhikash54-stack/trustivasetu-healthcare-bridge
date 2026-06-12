# Workflow Mapping

This document maps TrustivaSetu Healthcare Bridge mobile screens and actions to LMS workflows and business processes.

## 1. User Authentication and Role Access

Mobile:
- Login screen authenticates users against the LMS credential store.
- User role determines which screens and actions are available.

LMS:
- `src/lib/auth.ts`, `src/lib/permissions.ts`
- `SUPER_ADMIN`, `ADMIN`, `REGIONAL_MANAGER`, and `TEAM_MEMBER` control lead, clinic, and report access.

Mobile mapping:
- `SUPER_ADMIN` / `ADMIN`: full mobile admin/dashboard access.
- `REGIONAL_MANAGER`: region-scoped views for clinics and leads.
- `TEAM_MEMBER`: clinic-scoped lead creation and status updates.

## 2. Clinic/Hospital Onboarding

Mobile:
- Clinic registration screen collects hospital information and sends it to the LMS clinic API.
- Supports region assignment, RM assignment, business potential, and contact details.

LMS:
- `POST /api/clinics`
- `POST /api/los/sync/clinic` for LOS-sourced hospital onboarding.
- `src/lib/los/resolveClinicByHospitalName` auto-creates clinics from LOS records.

## 3. Lead / Enquiry Capture

Mobile:
- Patient enquiry form captures hospital, patient, guardian, estimate, financing need, and contact data.
- The app can create a lead and optionally follow a staged LOS workflow with OTP and KYC.

LMS:
- `POST /api/leads` to create leads.
- `POST /api/los/sync/enquiry` to sync LOS enquiries from LOS workflows.
- `src/lib/los-mapper.ts` maps LOS hospital/patient fields into LMS lead records.

Mobile mapping:
- Mobile `Lead` creation should create an LMS lead with `clinicId`, `applicantName`, `phone`, `amount`, `remarks`, and optional `externalId`.
- LOS enquiries should also include `losEnquiryId`, `hospitalName`, and `status` mapped to LMS lead status.

## 4. Lead Status Progression

Mobile:
- Lead lifecycle screens let users mark enquiry stages and set approvals/disbursements.
- Status transitions should follow LMS business rules.

LMS:
- `PATCH /api/leads/[id]` updates lead status and fields.
- `src/lib/permissions.ts` grants `LEAD_UPDATE` and `LEAD_UPDATE_STATUS` to authorized roles.
- `src/lib/los/status-engine.ts` defines LOS stage transitions for `ENQUIRY_CREATED` → `OTP_VERIFIED` → `KYC_PENDING` → `CREDIT_REVIEW` → `APPROVED` → `SANCTIONED` → `DISBURSED`.

Mobile mapping:
- `APPROVED`, `REJECTED`, `DISBURSED`, `CANCELLED` are primary actionable statuses.
- The LOS bridge can support additional mobile steps for OTP, KYC, banking and sanctioning.

## 5. Clinic and Lead Reporting

Mobile:
- Dashboard screens summarize leads, disbursed value, approval rates, lender performance, and clinic metrics.
- Clinic detail screen shows recent leads and target progress.

LMS:
- `GET /api/dashboard` returns aggregated metrics and trends.
- `GET /api/clinics/[id]` returns clinic detail and targets.
- `GET /api/exports` returns Excel downloads.

Mobile mapping:
- Use LMS dashboard metrics for home screen KPI cards.
- Use clinic detail API for clinic-specific performance and target context.

## 6. LOS Activity and Synchronization

Mobile:
- Operational actions like credit deviations, collections, payments, and comments should map to LOS sync activity.
- The app can send structured activity payloads to the LMS LOS sync endpoint.

LMS:
- `POST /api/los/sync/activity` handles `activityType` values such as `lead`, `credit`, `collection`, `lender`, `payment`, `target`, `attendance`, `visit`, `enquiry`, `operations`, `hospital`.
- `src/lib/los-activity.ts` routes activity payloads to lead updates, clinic metadata updates, and audit logs.
- `src/lib/los-menus.ts` defines LOS menu templates and expected fields for each action.

Mobile mapping:
- Map mobile action forms to these activity payloads using `activityType` and `menu`.
- For credit workflows, include `creditStatus` and `approvedAmount`.
- For collections, include `collectedAmount`, `collectionDate`, and optional `remarks`.

## 7. Target and Attendance Management

Mobile:
- Target entry screens allow mobile users to set monthly leads and disbursal targets.
- Attendance / field visit screens allow remote logging.

LMS:
- `POST /api/targets` creates/updates monthly target records.
- LOS activity endpoint records `attendance` or `target` payloads to clinic metadata and audit logs.

Mobile mapping:
- Use `target` payloads for RM and team goal tracking.
- Use `attendance` payloads to add `losActivities` metadata to clinics.

## 8. User Management

Mobile:
- If user administration is included, mobile screens may create and manage users.
- Users should be restricted to admin roles.

LMS:
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/[id]`
- Role mapping uses `USER_CREATE`, `USER_READ`, `USER_UPDATE`, `USER_DELETE`.

## 9. Webhook Support

Mobile:
- The bridge may optionally implement webhook-style notifications or external LMS event triggers.

LMS:
- General webhook handlers use `src/lib/webhooks.ts` with `x-webhook-secret` validation.
- LMS event ingestion writes to `WebhookEvent` and persists audit logs.

Mobile mapping:
- If the mobile app supports inbound business events from external systems, use LMS webhook semantics for secure payload delivery.

## 10. Priority Mobile Workflows

1. Patient enquiry capture → LMS lead creation
2. Clinic/hospital onboarding → LMS clinic sync
3. Lead status update → LMS lead PATCH
4. Dashboard metrics → LMS dashboard aggregation
5. LOS activity sync → LMS LOS activity bridge
6. Target & attendance reporting → LMS target + activity endpoints
7. User/role-aware access & region filtering
