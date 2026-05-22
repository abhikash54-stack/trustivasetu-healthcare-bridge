export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'RELATIONSHIP_ASSOCIATE'
  | 'OPERATIONS'
  | 'CREDIT'
  | 'COLLECTION'
  | 'FINANCE'
  | 'HOSPITAL'
  | 'BUSINESS_GROWTH'

export type LeadStatus =
  | 'ENQUIRY_CREATED'
  | 'OTP_VERIFIED'
  | 'KYC_PENDING'
  | 'KYC_COMPLETED'
  | 'BANKING_PENDING'
  | 'CREDIT_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SANCTIONED'
  | 'DISBURSED'
  | 'CLOSED'
  | 'CANCELLED'

export type EnquiryStatus = 'OPEN' | 'CONTACTED' | 'INTERESTED' | 'CONVERTED' | 'DROPPED'

export type VisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED'

export type AllocationStatus = 'UNASSIGNED' | 'ASSIGNED' | 'ACCEPTED' | 'REASSIGNED'

export type LosUser = {
  id: string
  fullName: string
  phone: string
  email: string
  password?: string
  role: string
  region?: string
  hospitals: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  reportingManager?: string
  createdAt: string
}

export type Hospital = {
  id: string
  name: string
  city: string
  phone: string
  email?: string
  stage: 'CREATED' | 'ONBOARDED' | 'SCHEME_ACTIVE' | 'ACTIVE_PARTNER'
  metadata?: Record<string, unknown>
  createdAt: string
}

export type LeadFormData = {
  enquiryType: string
  mobileNumber: string
  motherName: string
  patientName: string
  customerType: string
  bedType: string
  admissionDate: string
  dischargeDate: string
  consultationDate: string
  email: string
  hospitalName: string
  treatmentName: string
  medicalEstimate: string
  financingRequired: string
  callbackDate: string
  remarks: string
  dob?: string
}

export type AddressBlock = {
  line?: string
  pincode?: string
  city?: string
  district?: string
  state?: string
  locality?: string
  landmark?: string
}

export type EmploymentData = {
  officialEmail?: string
  personalEmail?: string
  companyName?: string
  employmentType?: string
  designation?: string
  salary?: string
}

export type CoApplicantData = {
  name?: string
  relation?: string
  income?: string
  employmentType?: string
  currentAddress?: string
  permanentAddress?: string
}

export type Lead = {
  id: string
  losEnquiryId: string
  applicantName: string
  mobileNumber: string
  email?: string
  hospitalName: string
  associateName: string
  estimateAmount: number
  approvedAmount?: number
  disbursedAmount?: number
  eligibility: 'ELIGIBLE' | 'REVIEW' | 'NOT_ELIGIBLE'
  autoApproval: boolean
  status: LeadStatus
  lender?: string
  allocationStatus: AllocationStatus
  assignedTo?: string
  form: LeadFormData
  currentAddress?: AddressBlock
  permanentAddress?: AddressBlock
  officeAddress?: AddressBlock
  employment?: EmploymentData
  coApplicant?: CoApplicantData
  auditLog: Array<{ at: string; action: string; by: string; note?: string }>
  createdAt: string
  updatedAt: string
}

export type Enquiry = {
  id: string
  name: string
  mobile: string
  patientName: string
  type: string
  hospitalName: string
  status: EnquiryStatus
  remarks?: string
  leadId?: string
  createdAt: string
}

export type Visit = {
  id: string
  date: string
  time: string
  hospitalName: string
  visitedWith: string
  reason: string
  status: VisitStatus
  notes?: string
  createdBy: string
  createdAt: string
}

export type AttendanceRecord = {
  id: string
  associateName: string
  date: string
  checkIn?: string
  checkOut?: string
  status: 'Present' | 'Absent' | 'Half Day'
  location?: string
}

export type AssociateTarget = {
  id: string
  associateName: string
  month: string
  leadsTarget: number
  disbursalTarget: number
  achievedLeads: number
  status: 'ACHIEVED' | 'PENDING' | 'MISSED'
}

export type EmiQuote = {
  id: string
  leadId?: string
  loanAmount: number
  advanceEmi: number
  tenure: number
  processingFee: number
  interestRate: number
  productCode: string
  monthlyEmi: number
  totalPayable: number
  netDisbursal: number
  createdAt: string
}

export type LosComment = {
  id: string
  leadId?: string
  text: string
  visibility: 'internal' | 'hospital' | 'credit'
  by: string
  createdAt: string
}

export type NachRecord = {
  id: string
  leadId: string
  reference: string
  status: 'INITIATED' | 'OTP_PENDING' | 'SUCCESS' | 'FAILED'
  bankName?: string
}

export type CollectionRecord = {
  id: string
  leadId: string
  amount: number
  dpdBucket: string
  outcome: string
  createdAt: string
}

export type LosDatabase = {
  users: LosUser[]
  hospitals: Hospital[]
  leads: Lead[]
  enquiries: Enquiry[]
  visits: Visit[]
  attendance: AttendanceRecord[]
  targets: AssociateTarget[]
  emiQuotes: EmiQuote[]
  comments: LosComment[]
  nach: NachRecord[]
  collections: CollectionRecord[]
}
