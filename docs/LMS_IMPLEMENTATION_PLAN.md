# TrustivaSetu Healthcare Bridge — LMS Product Gap Analysis & Implementation Roadmap

**Prepared:** 2026-06-13  
**Platform:** React Native / Expo SDK 56 / React 19  
**Scope:** Loan Management System (LMS) for healthcare financing — connecting patients, partner clinics, lenders, and regional managers.

---

## A. Current State

### A1. Implemented Screens

| Screen | Route | Stack | Status |
|---|---|---|---|
| SplashScreen | `Splash` | Auth | Implemented — branding only, auto-redirect |
| LoginScreen | `Login` | Auth | Implemented — real API call via `POST /auth/login` |
| ForgotPasswordScreen | `ForgotPassword` | Auth | Implemented — real API call via `POST /auth/forgot-password` |
| DashboardScreen | `Dashboard` | App / Tab | Implemented — metrics via `GET /dashboard`; empty state on API failure |
| LeadsScreen | `Leads` | App / Tab | Implemented — list via `GET /leads`; empty state when no data |
| LeadDetailsScreen | `LeadDetails` | App / Stack | Implemented — detail via `GET /leads/:id` |
| EnquiryScreen | `Enquiry` | App / Tab | Implemented — list via `GET /los/sync/enquiry`; empty state |
| EnquiryDetailsScreen | `EnquiryDetails` | App / Stack | Implemented — detail via `GET /los/sync/enquiry/:id` |
| ClinicsScreen | `Clinics` | App / Tab | Implemented — list via `GET /clinics`; empty state |
| ClinicDetailsScreen | `ClinicDetails` | App / Stack | Implemented — detail via `GET /clinics/:id` |
| TasksScreen | `Tasks` | App / Tab | Shell only — empty state, no API integration |
| AgreementsScreen | `Agreements` | App / Tab | Shell only — empty state, no API integration |
| ProfileScreen | `Profile` | App / Tab | Implemented — reads from Redux auth state; sign out |
| RMAssignmentScreen | `RMAssignment` | App / Stack | Shell only — local state, no API call |

### A2. Navigation Structure

```
Root (conditional on isAuthenticated)
│
├── AuthNavigator (NativeStack)
│   ├── Splash
│   ├── Login
│   └── ForgotPassword
│
└── AppNavigator (NativeStack)
    ├── Main → MainTabs (BottomTabs)
    │   ├── Dashboard
    │   ├── Leads
    │   ├── Enquiry
    │   ├── Clinics
    │   ├── Tasks
    │   ├── Agreements
    │   └── Profile
    ├── LeadDetails        (param: leadId)
    ├── ClinicDetails      (param: clinicId)
    ├── EnquiryDetails     (param: enquiryId)
    └── RMAssignment       (param: clinicId)
```

### A3. Existing Redux Slices

| Slice | State | Actions |
|---|---|---|
| `auth` | `{ isAuthenticated, user: UserProfile | null, token }` | `signIn`, `signOut` |

No other slices exist. No async thunks. No middleware beyond Redux Toolkit defaults.

### A4. Existing Services & APIs

| Service | Functions | Endpoint |
|---|---|---|
| `authService` | `login()`, `requestPasswordReset()` | `POST /auth/login`, `POST /auth/forgot-password` |
| `dashboardService` | `fetchDashboard()` | `GET /dashboard` |
| `leadService` | `fetchLeads()`, `fetchLeadById(id)` | `GET /leads`, `GET /leads/:id` |
| `enquiryService` | `fetchEnquiries()`, `fetchEnquiryById(id)` | `GET /los/sync/enquiry`, `GET /los/sync/enquiry/:id` |
| `clinicService` | `fetchClinics()`, `fetchClinicById(id)` | `GET /clinics`, `GET /clinics/:id` |
| `storageService` | `saveAuthState()`, `loadAuthState()`, `removeAuthState()` | AsyncStorage (`@trustiva:auth`) |

**API client:** Axios instance pointing to `https://api.trustivasetuhealth.com` (configurable via `app.json` extra). Timeout: 15 s.

### A5. Existing Data Models (TypeScript interfaces)

```typescript
// Core
UserProfile       { id, name, email, phone, role }
LoginCredentials  { email, password }

// Leads
Lead              { id, applicantName, clinicName, source, status, assignedTo, updatedAt, amount }
LeadDetail        extends Lead + { phone, email, approvedAmount, disbursedAmount,
                    applicationDate, approvalDate, disbursalDate, remarks,
                    lenderName, stage, statusHistory[] }

// Clinics
Clinic            { id, name, location, services[], status? }
ClinicDetail      extends Clinic + { address, contactPerson, contactNumber, email,
                    businessPotential, assignedRM, currentTargets, recentLeads[], notes }

// Enquiries
Enquiry           { id, title, status, patientName, requestedAt }
EnquiryDetail     extends Enquiry + { clinicName, enquiryType, hospitalName, mobileNumber,
                    treatmentName, financingRequired, remarks, referenceId }

// Dashboard
DashboardMetrics  { totalLeads, approvedLeads, disbursedLeads, pendingLeads, approvedValue,
                    disbursedValue, activeClinics, topClinic, leadStatusCounts, runRate, trend[] }

// Lightweight stubs (no service integration)
Task              { id, title, dueDate, progress }
Agreement         { id, title, counterparty, status }
```

### A6. Existing Roles & Permissions

**Currently implemented:** None. `UserProfile.role` is a plain string with no enforcement. All authenticated users see the same UI. No permission checks anywhere in the codebase.

### A7. Existing LMS-Related Functionality

| Feature | State |
|---|---|
| Session persistence (AsyncStorage) | Implemented |
| Token-based auth | Implemented (token stored in Redux) |
| Lead list + detail view | Implemented (read-only) |
| Clinic list + detail view | Implemented (read-only) |
| Enquiry list + detail view | Implemented (read-only) |
| Dashboard summary metrics | Implemented (read-only) |
| RM assignment | Shell (no API call) |
| Lead status update | Missing |
| Document upload | Missing |
| Lender selection | Missing |
| Sanction / disbursal flow | Missing |
| Task management | Missing |
| Agreement signing | Missing |
| Notifications | Missing |
| Offline support | Missing |
| Role-based access control | Missing |
| Reporting | Missing |
| Clinic onboarding workflow | Missing |

---

## B. Missing LMS Features

### B1. Authentication & Session
- Token refresh / expiry handling
- OTP-based 2FA
- Biometric / PIN lock after session timeout
- Forced logout on 401 responses (interceptor)
- Logout from all devices (server-side token invalidation)

### B2. Lead Lifecycle Management
The full loan lifecycle is entirely absent. Currently the app can only view leads in read-only mode. Missing:

| Stage | Missing Capability |
|---|---|
| Lead Creation | Form to create new lead from clinic/RM |
| Document Collection | Upload KYC documents (Aadhaar, PAN, medical estimate) |
| Lender Selection | Eligibility check across lenders; present options |
| Application Submission | Submit loan application to selected lender |
| Credit Assessment | View credit decision; accept/reject |
| Sanction | Receive sanction letter; confirm terms |
| Loan Agreement | Generate and sign loan agreement |
| Disbursement | Confirm disbursal; notify clinic |
| EMI Schedule | View repayment schedule |
| Collections | Track EMI payments; flag overdue |
| Lead Status Update | RM/admin can move lead through stages |
| Rejection Handling | Capture rejection reason; suggest alternatives |

### B3. Clinic Onboarding Workflow
Currently clinics are view-only once onboarded. Missing:

- Multi-step onboarding wizard (registration → KYB docs → agreement → RM assignment → activation)
- Onboarding status tracking per clinic
- Document verification workflow
- Clinic performance scorecard
- Target setting interface (monthly leads + disbursal targets)
- Clinic deactivation / suspension flow

### B4. Enquiry-to-Lead Conversion
- Convert an enquiry directly into a lead (one-tap)
- Link enquiry to an existing lead
- Enquiry triage and routing to correct RM

### B5. Task Management
- Create, assign, and complete tasks
- Task priority (High / Medium / Low)
- Due date reminders
- Link tasks to leads or clinics
- Task completion with notes
- Overdue task escalation

### B6. Agreement Management
- Upload and store agreement documents
- Agreement status workflow (Draft → Sent → Signed → Active → Expired)
- Expiry alerts
- DocuSign / e-signature integration
- Agreement linked to clinic or lender entity

### B7. Notifications
- In-app notification centre
- Push notifications (lead status change, task due, document required)
- SMS / WhatsApp alerts for patients
- RM activity feed

### B8. Reporting & Analytics
- Lead funnel report (applied → approved → disbursed → collected)
- RM performance report (leads per RM, conversion rate)
- Clinic contribution report
- Lender utilisation report
- Monthly run-rate vs target
- Disbursal aging report
- Collection efficiency report
- Exportable to PDF / CSV

### B9. Role-Based Access Control
- No RBAC exists; all authenticated users see identical UI
- Role enforcement must be implemented across every screen and API call

### B10. Offline & Sync
- No offline capability; app fails silently when API is unreachable
- Need queue-based sync for RM field operations

### B11. Admin Panel
- User management (create RM, assign territory)
- Lender management (add/configure lenders)
- System-wide settings (interest rates, eligibility rules)
- Bulk data import (clinic/lead CSV upload)

---

## C. Required Screens

### C1. Authentication
| Screen | Purpose |
|---|---|
| OTPVerificationScreen | Verify OTP for 2FA or phone-based login |
| PINSetupScreen | Set device PIN after first login |
| BiometricPromptScreen | Biometric unlock |
| SessionExpiredScreen | Prompt re-login after token expiry |

### C2. Lead Management
| Screen | Purpose |
|---|---|
| LeadCreateScreen | Multi-step form: applicant info → clinic → treatment → amount |
| LeadDocumentsScreen | Upload KYC/medical docs per lead |
| LenderSelectionScreen | Show eligible lenders with rates; allow selection |
| SanctionReviewScreen | View sanction letter, accept terms |
| LoanAgreementScreen | Sign loan agreement (in-app or DocuSign) |
| DisbursementConfirmScreen | Confirm disbursal details and clinic account |
| EMIScheduleScreen | View repayment schedule for a loan |
| LeadStatusUpdateScreen | Dropdown to move lead stage; add notes |

### C3. Clinic Management
| Screen | Purpose |
|---|---|
| ClinicOnboardingStep1Screen | Basic info: name, address, services |
| ClinicOnboardingStep2Screen | KYB documents: GST, PAN, registration cert |
| ClinicOnboardingStep3Screen | Agreement review and signing |
| ClinicOnboardingStep4Screen | RM assignment and target setting |
| ClinicPerformanceScreen | Scorecard: leads, disbursal, conversion rate |
| ClinicTargetSetScreen | Set monthly targets (leads + ₹ disbursal) |

### C4. Tasks
| Screen | Purpose |
|---|---|
| TaskListScreen (full) | Live list from API; filter by status/priority |
| TaskCreateScreen | Create task with title, priority, due date, link to entity |
| TaskDetailScreen | View task; mark complete; add notes |

### C5. Agreements
| Screen | Purpose |
|---|---|
| AgreementListScreen (full) | Live list from API; filter by status |
| AgreementDetailScreen | View agreement; download PDF; sign |
| AgreementUploadScreen | Upload new agreement document |

### C6. Notifications
| Screen | Purpose |
|---|---|
| NotificationCentreScreen | Inbox of all in-app notifications |

### C7. Reporting
| Screen | Purpose |
|---|---|
| ReportsScreen | Select and view report type |
| LeadFunnelReportScreen | Visual funnel by status |
| RMPerformanceReportScreen | Per-RM metrics table |
| ClinicReportScreen | Per-clinic contribution |
| DisbursalReportScreen | Monthly disbursal trend |

### C8. Admin
| Screen | Purpose |
|---|---|
| UserManagementScreen | List/create/deactivate users |
| LenderManagementScreen | Configure lenders and eligibility rules |
| SystemSettingsScreen | Platform-wide configuration |

---

## D. Required APIs

### D1. Authentication
```
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/forgot-password
POST   /auth/verify-otp
POST   /auth/resend-otp
PUT    /auth/change-password
```

### D2. Leads
```
GET    /leads                          List with filters (status, assignedTo, clinicId, dateRange)
POST   /leads                          Create new lead
GET    /leads/:id                      Detail
PUT    /leads/:id                      Update lead fields
PUT    /leads/:id/status               Move lead to next stage
POST   /leads/:id/documents            Upload document for lead
GET    /leads/:id/documents            List documents for lead
GET    /leads/:id/sanction             Get sanction letter
POST   /leads/:id/disbursement         Confirm disbursement
GET    /leads/:id/emi-schedule         Repayment schedule
GET    /leads/export                   Export leads CSV
```

### D3. Clinics
```
GET    /clinics                        List with filters (status, city, assignedRM)
POST   /clinics                        Create clinic (step 1 of onboarding)
GET    /clinics/:id                    Detail
PUT    /clinics/:id                    Update clinic
PUT    /clinics/:id/status             Activate / deactivate
PUT    /clinics/:id/assign-rm          Assign or reassign RM
POST   /clinics/:id/documents          Upload KYB documents
GET    /clinics/:id/documents          List documents
PUT    /clinics/:id/targets            Set monthly targets
GET    /clinics/:id/performance        Scorecard metrics
```

### D4. Enquiries
```
GET    /los/sync/enquiry               List with filters
GET    /los/sync/enquiry/:id           Detail
PUT    /los/sync/enquiry/:id/status    Update enquiry status
POST   /los/sync/enquiry/:id/convert   Convert enquiry to lead
```

### D5. Tasks
```
GET    /tasks                          List (filter by assignedTo, status, priority)
POST   /tasks                          Create
GET    /tasks/:id                      Detail
PUT    /tasks/:id                      Update
PUT    /tasks/:id/complete             Mark complete with notes
DELETE /tasks/:id                      Delete
```

### D6. Agreements
```
GET    /agreements                     List
POST   /agreements                     Create / upload
GET    /agreements/:id                 Detail + document URL
PUT    /agreements/:id/status          Update status
POST   /agreements/:id/sign            Initiate e-signing
```

### D7. Lenders
```
GET    /lenders                        List active lenders
GET    /lenders/:id                    Lender detail + eligibility rules
POST   /lenders/eligibility-check      Check eligibility for a lead amount
```

### D8. Documents
```
POST   /documents/upload               Multipart upload; return documentId
GET    /documents/:id                  Fetch metadata + signed URL
PUT    /documents/:id/verify           Admin/ops mark document verified
DELETE /documents/:id                  Remove document
```

### D9. Notifications
```
GET    /notifications                  List for current user (paginated)
PUT    /notifications/:id/read         Mark read
PUT    /notifications/read-all         Mark all read
DELETE /notifications/:id              Delete
POST   /notifications/register-token   Register push token (Expo/FCM)
```

### D10. Reports
```
GET    /reports/lead-funnel            Counts by stage
GET    /reports/rm-performance         Per-RM metrics (leads, disbursal, conversion)
GET    /reports/clinic-contribution    Per-clinic summary
GET    /reports/disbursal-trend        Monthly disbursal ₹ values
GET    /reports/collection-efficiency  EMI collection rates
GET    /reports/export/:type           PDF/CSV export
```

### D11. Dashboard
```
GET    /dashboard                      Aggregated metrics for current user's scope
```

### D12. Admin
```
GET    /admin/users                    List users
POST   /admin/users                    Create user
PUT    /admin/users/:id                Update user (role, territory)
PUT    /admin/users/:id/deactivate     Deactivate
GET    /admin/lenders                  Lender management
POST   /admin/lenders                  Add lender
PUT    /admin/lenders/:id              Configure lender
```

---

## E. Required Data Models

### E1. User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;                         // ADMIN | RM | CLINIC_PARTNER | FINANCE | OPERATIONS
  territory?: string;                     // For RM: city/region
  assignedClinicIds?: string[];           // Clinics this RM manages
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}
```

### E2. Lead (full model)
```typescript
interface Lead {
  id: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  applicantPAN?: string;
  clinicId: string;
  clinicName: string;
  treatmentName: string;
  hospitalName: string;
  requestedAmount: number;
  approvedAmount?: number;
  disbursedAmount?: number;
  lenderId?: string;
  lenderName?: string;
  source: LeadSource;                     // REFERRAL | CLINIC | WEBSITE | WALK_IN | CAMPAIGN
  status: LeadStatus;                     // NEW | DOCUMENT_PENDING | SUBMITTED | UNDER_REVIEW |
                                          // APPROVED | SANCTIONED | AGREEMENT_SIGNED |
                                          // DISBURSED | REJECTED | CANCELLED | CLOSED
  stage: string;
  assignedTo: string;                     // RM userId
  interestRate?: number;
  tenureMonths?: number;
  emiAmount?: number;
  disbursalDate?: string;
  applicationDate: string;
  approvalDate?: string;
  rejectionReason?: string;
  remarks?: string;
  documents: Document[];
  statusHistory: LeadStatusEvent[];
  createdAt: string;
  updatedAt: string;
}

interface LeadStatusEvent {
  status: LeadStatus;
  updatedAt: string;
  updatedBy: string;
  note?: string;
}
```

### E3. Clinic (full model)
```typescript
interface Clinic {
  id: string;
  name: string;
  registrationNumber?: string;
  gstin?: string;
  pan?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  services: string[];
  specialities?: string[];
  status: ClinicStatus;                   // PROSPECT | ONBOARDING | ACTIVE | SUSPENDED | INACTIVE
  onboardingStep: number;                 // 1–4
  assignedRMId?: string;
  assignedRM?: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  businessPotential?: string;
  monthlyTargets?: MonthlyTarget[];
  documents: Document[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MonthlyTarget {
  month: string;                          // "YYYY-MM"
  leadsTarget: number;
  disbursalTarget: number;               // in paise / raw number
  achievedLeads: number;
  achievedDisbursal: number;
}
```

### E4. Enquiry (full model)
```typescript
interface Enquiry {
  id: string;
  referenceId: string;
  title: string;
  enquiryType: EnquiryType;              // BILLING | PAYMENT | ONBOARDING | FINANCING | SUPPORT
  status: EnquiryStatus;                 // PENDING | IN_PROGRESS | CONVERTED | CLOSED | CANCELLED
  patientName: string;
  patientPhone: string;
  clinicId: string;
  clinicName: string;
  hospitalName: string;
  treatmentName: string;
  financingRequired: number;
  linkedLeadId?: string;
  remarks?: string;
  requestedAt: string;
  updatedAt: string;
}
```

### E5. Task (full model)
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;                 // HIGH | MEDIUM | LOW
  status: TaskStatus;                     // OPEN | IN_PROGRESS | COMPLETED | CANCELLED
  assignedTo: string;                     // userId
  assignedBy: string;                     // userId
  linkedEntityType?: 'LEAD' | 'CLINIC' | 'ENQUIRY' | 'AGREEMENT';
  linkedEntityId?: string;
  dueDate: string;
  completedAt?: string;
  completionNote?: string;
  createdAt: string;
  updatedAt: string;
}
```

### E6. Agreement (full model)
```typescript
interface Agreement {
  id: string;
  title: string;
  type: AgreementType;                    // CLINIC_PARTNERSHIP | LENDER_SLA | PAYMENT_MANAGER |
                                          // LOAN_AGREEMENT | CONFIDENTIALITY
  status: AgreementStatus;               // DRAFT | SENT | SIGNED | ACTIVE | EXPIRED | TERMINATED
  linkedEntityType?: 'CLINIC' | 'LENDER' | 'LEAD';
  linkedEntityId?: string;
  counterparty: string;
  counterpartyEmail?: string;
  documentUrl?: string;
  signedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### E7. Lender
```typescript
interface Lender {
  id: string;
  name: string;
  logoUrl?: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  interestRatePA: number;
  processingFeePercent: number;
  eligibilityCriteria: string[];
  supportedTreatments: string[];
  isActive: boolean;
  turnaroundDays: number;
  createdAt: string;
}
```

### E8. Document
```typescript
interface Document {
  id: string;
  entityId: string;
  entityType: 'LEAD' | 'CLINIC' | 'USER';
  documentType: DocumentType;            // AADHAAR | PAN | MEDICAL_ESTIMATE | GST |
                                          // REGISTRATION | BANK_STATEMENT | SANCTION_LETTER |
                                          // LOAN_AGREEMENT | OTHER
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;                // PENDING | VERIFIED | REJECTED
  uploadedBy: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}
```

### E9. Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;               // LEAD_STATUS | TASK_DUE | DOCUMENT_REQUIRED |
                                         // SANCTION_RECEIVED | DISBURSAL_CONFIRMED |
                                         // AGREEMENT_SIGNED | SYSTEM
  read: boolean;
  data?: Record<string, string>;         // Deep-link payload (e.g., { leadId: '...' })
  createdAt: string;
}
```

---

## F. Required User Roles

| Role | Code | Description |
|---|---|---|
| Admin | `ADMIN` | Full system access. Manages users, lenders, system config, all reports. |
| Regional Manager | `RM` | Manages assigned clinics and their leads. Field-facing role. |
| Clinic Partner | `CLINIC_PARTNER` | Read-only access to own clinic data and associated leads. |
| Finance Manager | `FINANCE` | Approves disbursements, manages lenders, views all financial reports. |
| Operations | `OPERATIONS` | Handles document verification, task management, compliance checks. |

---

## G. Permission Matrix

| Capability | ADMIN | RM | CLINIC_PARTNER | FINANCE | OPERATIONS |
|---|:---:|:---:|:---:|:---:|:---:|
| **Auth** | | | | | |
| Login / Logout | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage users | ✓ | — | — | — | — |
| **Leads** | | | | | |
| View all leads | ✓ | Own only | Own clinic | ✓ | ✓ |
| Create lead | ✓ | ✓ | ✓ | — | — |
| Update lead status | ✓ | ✓ | — | ✓ | ✓ |
| Upload documents | ✓ | ✓ | ✓ | — | ✓ |
| Verify documents | ✓ | — | — | — | ✓ |
| Approve / Sanction | ✓ | — | — | ✓ | — |
| Confirm disbursement | ✓ | — | — | ✓ | — |
| **Clinics** | | | | | |
| View all clinics | ✓ | Own only | Own only | ✓ | ✓ |
| Onboard clinic | ✓ | ✓ | — | — | ✓ |
| Assign RM | ✓ | — | — | — | — |
| Set targets | ✓ | ✓ | — | — | — |
| Deactivate clinic | ✓ | — | — | — | — |
| **Enquiries** | | | | | |
| View enquiries | ✓ | Own only | Own only | ✓ | ✓ |
| Update enquiry status | ✓ | ✓ | — | — | ✓ |
| Convert to lead | ✓ | ✓ | ✓ | — | — |
| **Tasks** | | | | | |
| View all tasks | ✓ | Own only | — | — | Own only |
| Create task | ✓ | ✓ | — | — | ✓ |
| Complete task | ✓ | Own only | — | — | Own only |
| Delete task | ✓ | — | — | — | — |
| **Agreements** | | | | | |
| View agreements | ✓ | Own scope | Own only | ✓ | ✓ |
| Upload agreement | ✓ | — | — | ✓ | ✓ |
| Sign agreement | ✓ | — | ✓ | ✓ | — |
| **Lenders** | | | | | |
| View lenders | ✓ | ✓ | — | ✓ | — |
| Manage lenders | ✓ | — | — | ✓ | — |
| Run eligibility check | ✓ | ✓ | — | ✓ | — |
| **Notifications** | | | | | |
| Receive notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Reports** | | | | | |
| View all reports | ✓ | Own scope | — | ✓ | — |
| Export reports | ✓ | — | — | ✓ | — |
| **Admin** | | | | | |
| System settings | ✓ | — | — | — | — |
| Bulk import | ✓ | — | — | — | — |

---

## Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–3)
**Goal:** Production-ready auth, RBAC scaffolding, real API connectivity.

- [ ] Implement token refresh interceptor (401 → refresh → retry)
- [ ] Add forced logout on token expiry with SessionExpiredScreen
- [ ] Implement RBAC context (read `user.role` from Redux; expose `usePermission()` hook)
- [ ] Create `PermissionGate` component to conditionally render UI by role
- [ ] Add Axios request/response interceptors (auth header, error normalisation)
- [ ] Implement `OTPVerificationScreen`
- [ ] Add React Query error boundaries per screen
- [ ] Centralise error handling (toast or inline error messages)

### Phase 2 — Lead Lifecycle (Weeks 4–7)
**Goal:** Full loan journey from creation to disbursement.

- [ ] `LeadCreateScreen` — multi-step wizard (applicant → clinic → treatment → amount)
- [ ] `LeadDocumentsScreen` — document upload with camera/gallery picker
- [ ] `LenderSelectionScreen` — eligibility check + lender cards
- [ ] `SanctionReviewScreen` — view and accept sanction terms
- [ ] `LoanAgreementScreen` — in-app sign or DocuSign deep link
- [ ] `DisbursementConfirmScreen` — confirm disbursal to clinic account
- [ ] `EMIScheduleScreen` — repayment table
- [ ] `LeadStatusUpdateScreen` — stage dropdown with notes
- [ ] Extend `LeadsScreen` with filters (status, date, RM, clinic)

### Phase 3 — Clinic Onboarding (Weeks 8–10)
**Goal:** End-to-end clinic partner lifecycle.

- [ ] `ClinicOnboardingStep1–4` screens (wizard with step indicator)
- [ ] Document upload for KYB
- [ ] `ClinicPerformanceScreen` with charts
- [ ] `ClinicTargetSetScreen`
- [ ] Extend `ClinicsScreen` with status filter and search

### Phase 4 — Tasks, Agreements, Enquiry Conversion (Weeks 11–12)
**Goal:** Operational workflow completion.

- [ ] `TaskCreateScreen`, `TaskDetailScreen` with full API integration
- [ ] `TasksScreen` live from API with filters
- [ ] `AgreementDetailScreen`, `AgreementUploadScreen`
- [ ] `AgreementsScreen` live from API
- [ ] Enquiry → Lead conversion flow
- [ ] `EnquiryScreen` triage filter (type, status)

### Phase 5 — Notifications & Reporting (Weeks 13–15)
**Goal:** Visibility and communication.

- [ ] Push notification setup (Expo Notifications + FCM)
- [ ] `NotificationCentreScreen`
- [ ] Register push token on login (`POST /notifications/register-token`)
- [ ] Deep-link routing from notification payload
- [ ] `ReportsScreen` with selectable report types
- [ ] `LeadFunnelReportScreen`, `RMPerformanceReportScreen`, `DisbursalReportScreen`
- [ ] PDF/CSV export

### Phase 6 — Admin & Polish (Weeks 16–18)
**Goal:** Administrative control and production hardening.

- [ ] `UserManagementScreen`
- [ ] `LenderManagementScreen`
- [ ] `SystemSettingsScreen`
- [ ] Offline queue for RM field operations (react-native-mmkv + background sync)
- [ ] Biometric/PIN lock screen
- [ ] End-to-end testing (Detox)
- [ ] Performance profiling (Flipper / Expo DevTools)
- [ ] Accessibility audit (screen reader support)
- [ ] Production build + OTA update pipeline (EAS Build + EAS Update)

---

## Technical Dependencies to Add

| Package | Purpose | Phase |
|---|---|---|
| `expo-image-picker` | Camera/gallery for document upload | 2 |
| `expo-file-system` | File handling for uploads | 2 |
| `expo-notifications` | Push notification registration and receipt | 5 |
| `expo-local-authentication` | Biometric / PIN lock | 6 |
| `react-native-mmkv` | Fast offline storage / sync queue | 6 |
| `react-native-pdf` | In-app PDF viewer (sanction letter, agreement) | 2 |
| `react-native-chart-kit` or `victory-native` | Charts for reports and performance screens | 5 |
| `react-hook-form` + `zod` | Form validation for multi-step lead/clinic wizards | 2 |
| `@tanstack/react-query` (existing) | Extend with optimistic updates and mutation invalidation | 2 |

---

*This document reflects the state of the codebase as of 2026-06-13. Update it as features are implemented.*
