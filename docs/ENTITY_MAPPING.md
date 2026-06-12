# Entity Mapping

This mapping connects TrustivaSetu Healthcare Bridge mobile concepts to the LMS domain entities found in `trustiva-lms-project`.

## Primary Entities

- Mobile `User` ↔ LMS `User`
  - Fields: `id`, `email`, `name`, `role`, `phone`, `regionIds`, `clinicIds`, `isActive`
  - Roles: `SUPER_ADMIN`, `ADMIN`, `REGIONAL_MANAGER`, `TEAM_MEMBER`

- Mobile `Clinic` / `Hospital` ↔ LMS `Clinic`
  - Fields: `id`, `name`, `address`, `contactPerson`, `contactNumber`, `email`, `businessPotential`, `accountNumber`, `regionId`, `assignedRMId`, `isActive`, `metadata`
  - `Clinic` is the primary onboarding entity for hospital partners.

- Mobile `Lead` / `Enquiry` ↔ LMS `Lead`
  - Fields: `id`, `externalId`, `applicantName`, `phone`, `email`, `amount`, `status`, `approvedAmount`, `disbursedAmount`, `applicationDate`, `approvalDate`, `disbursalDate`, `remarks`, `clinicId`, `lenderId`, `enquiryType`, `treatmentName`, `motherName`, `losEnquiryId`, `metadata`
  - `Lead` is the core financing item in the LMS.

- Mobile `Target` ↔ LMS `Target`
  - Fields: `id`, `year`, `month`, `leadsTarget`, `disbursalTarget`, `userId`, `regionId`, `clinicId`
  - Used for RM/team goals and run-rate tracking.

- Mobile `AuditLog` ↔ LMS `AuditLog`
  - Tracks create/update/delete and sync actions.

- Mobile `Notification` ↔ LMS `Notification`
  - User-facing alerts for lead status updates, clinic onboarding, and workflow actions.

## LOS/Operations-Specific Entities

- Mobile `Enquiry` ↔ LMS `Lead` / `LeadFormData`
  - LOS enquiry data is mapped into LMS leads via `losEnquiryId`.
  - Key form fields: `hospitalName`, `patientName`, `mobileNumber`, `enquiryType`, `medicalEstimate`, `financingRequired`, `treatmentName`, `remarks`.

- Mobile `Visit` ↔ LMS `Clinic.metadata.losActivities` / `Clinic` update
  - LOS visits are stored as metadata on clinic records.

- Mobile `AttendanceRecord` ↔ LMS `AuditLog` / `Clinic.metadata.losActivities`
  - Attendance sync is recorded as LOS activity plus audit entry.

- Mobile `Collection` / `Payment` ↔ LMS `Lead` updates + `Clinic.metadata`
  - Collections may update `disbursedAmount`, `status`, and lead metadata.

- Mobile `CreditDecision` ↔ LMS `Lead` status transitions and metadata
  - Credit approvals/disapprovals map to `Lead.status` values: `APPROVED`, `REJECTED`, `DISBURSED`.

## Status Mappings

- Mobile workflow statuses should align with LMS `LeadStatus` enum:
  - `PENDING` (LMS `PENDING`)
  - `APPROVED` (LMS `APPROVED`)
  - `REJECTED` (LMS `REJECTED`)
  - `DISBURSED` (LMS `DISBURSED`)
  - `CANCELLED` (LMS `CANCELLED`)

- LOS-specific mobile statuses can map to the LMS LOS workflow enum from `src/lib/los/types.ts` for multi-step patient journeys, e.g. `ENQUIRY_CREATED`, `OTP_VERIFIED`, `KYC_PENDING`, `CREDIT_REVIEW`, `SANCTIONED`.

## Lookup Entities

- `Region` ↔ LMS `Region`
  - Used for access filters and clinic assignment.

- `Lender` ↔ LMS `Lender`
  - Used for lender-wise analytics and approvals.

- `WebhookEvent` ↔ external webhook ingestion
  - Mobile app may leverage webhook-style sync notifications but does not need to mirror the LMS internal event store directly.

## Derived Entities

- Mobile `DashboardMetrics` ↔ aggregated LMS lead/clinic metrics
  - Total leads, approved leads, disbursed leads, lead value, approved value, disbursal value, approval/disbursal rate.

- Mobile `TrendSeries` ↔ LMS monthly trend data
  - Derived from lead application dates and status aggregation.

- Mobile `RunRate` ↔ LMS target performance metrics
  - Derived from `Target` records, MTD lead counts, and disbursal values.
