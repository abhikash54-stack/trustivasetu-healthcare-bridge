export type LosMenuMeta = {
  title: string
  description: string
  activityType: 'lead' | 'credit' | 'collection' | 'lender' | 'payment' | 'target' | 'attendance' | 'visit' | 'enquiry' | 'operations' | 'hospital'
  fields: Array<{
    key: string
    label: string
    type?: 'text' | 'number' | 'date' | 'select' | 'textarea'
    options?: string[]
    required?: boolean
  }>
}

const leadRefFields = [
  { key: 'hospitalName', label: 'Hospital Name', type: 'select' as const, required: true },
  { key: 'patientName', label: 'Patient Name', required: true },
  { key: 'mobileNumber', label: 'Mobile (10 digit)', required: true },
] as const

export const LOS_MENU_META: Record<string, LosMenuMeta> = {
  'Associate Targets': {
    title: 'Associate Targets',
    description: 'Monthly targets sync to LMS — used in RM reports.',
    activityType: 'target',
    fields: [
      { key: 'associateName', label: 'Associate Name', required: true },
      { key: 'month', label: 'Month (YYYY-MM)', required: true },
      { key: 'leadsTarget', label: 'Leads Target', type: 'number' },
      { key: 'disbursalTarget', label: 'Disbursal Target (₹ Lakh)', type: 'number' },
    ],
  },
  Attendance: {
    title: 'Attendance',
    description: 'Field attendance logged in LMS audit trail.',
    activityType: 'attendance',
    fields: [
      { key: 'associateName', label: 'Associate Name', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Present', 'Absent', 'Half Day'] },
    ],
  },
  'All Leads': {
    title: 'All Leads — Quick Update',
    description: 'Updates existing lead or creates one in LMS → Reports update automatically.',
    activityType: 'lead',
    fields: [
      ...leadRefFields,
      { key: 'financingRequired', label: 'Financing Required (₹)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea' },
    ],
  },
  'Lead Allocation': {
    title: 'Lead Allocation',
    description: 'Assign lead to hospital/RM in LMS.',
    activityType: 'lead',
    fields: [
      ...leadRefFields,
      { key: 'assignedRMEmail', label: 'RM Email (@trustivasetu.com)' },
      { key: 'remarks', label: 'Notes', type: 'textarea' },
    ],
  },
  'Active Cases': {
    title: 'Active Cases',
    description: 'Open cases sync as leads — visible in LMS Leads & monthly reports.',
    activityType: 'lead',
    fields: [
      ...leadRefFields,
      { key: 'treatmentName', label: 'Treatment' },
      { key: 'status', label: 'Case Status', type: 'select', options: ['PENDING', 'APPROVED', 'DISBURSED'] },
    ],
  },
  'My Leads': {
    title: 'My Leads',
    description: 'Your pipeline entries → LMS Leads.',
    activityType: 'lead',
    fields: [...leadRefFields, { key: 'financingRequired', label: 'Amount (₹)', type: 'number' }],
  },
  'My Enquiries': {
    title: 'My Enquiries',
    description: 'Enquiry data → LMS Leads for reporting.',
    activityType: 'enquiry',
    fields: [...leadRefFields, { key: 'enquiryType', label: 'Enquiry Type' }],
  },
  Visits: {
    title: 'Visits',
    description: 'Clinic visit log → clinic metadata in LMS.',
    activityType: 'visit',
    fields: [
      { key: 'hospitalName', label: 'Hospital', required: true },
      { key: 'visitDate', label: 'Visit Date', type: 'date', required: true },
      { key: 'purpose', label: 'Purpose', type: 'textarea' },
    ],
  },
  'Finance Estimator': {
    title: 'Finance Estimator',
    description: 'Estimate syncs to lead amount in LMS reports.',
    activityType: 'lead',
    fields: [
      ...leadRefFields,
      { key: 'medicalEstimate', label: 'Medical Estimate (₹)', type: 'number', required: true },
      { key: 'financingRequired', label: 'Financing Required (₹)', type: 'number' },
    ],
  },
  'Credit deviations': {
    title: 'Credit Deviations',
    description: 'Credit decision → LMS lead status & approval reports.',
    activityType: 'credit',
    fields: [
      ...leadRefFields,
      { key: 'creditStatus', label: 'Decision', type: 'select', options: ['APPROVED', 'REJECTED', 'PENDING'], required: true },
      { key: 'approvedAmount', label: 'Approved Amount (₹ Lakh)', type: 'number' },
      { key: 'deviationReason', label: 'Deviation Reason', type: 'textarea' },
    ],
  },
  Collections: {
    title: 'Collections',
    description: 'Collection posted → LMS disbursal & collection reports.',
    activityType: 'collection',
    fields: [
      ...leadRefFields,
      { key: 'collectedAmount', label: 'Collected Amount (₹)', type: 'number', required: true },
      { key: 'collectionDate', label: 'Collection Date', type: 'date' },
      { key: 'remarks', label: 'Remarks', type: 'textarea' },
    ],
  },
  'Tele collection': {
    title: 'Tele Collection',
    description: 'Tele-collection syncs to LMS lead activity.',
    activityType: 'collection',
    fields: [
      ...leadRefFields,
      { key: 'collectedAmount', label: 'Amount Collected (₹)', type: 'number' },
      { key: 'remarks', label: 'Call Notes', type: 'textarea' },
    ],
  },
  'Nach registrations': {
    title: 'NACH Registration',
    description: 'NACH mandate logged on lead in LMS.',
    activityType: 'operations',
    fields: [
      ...leadRefFields,
      { key: 'nachReference', label: 'NACH Reference', required: true },
      { key: 'nachStatus', label: 'Status', type: 'select', options: ['Registered', 'Failed', 'Pending'] },
    ],
  },
  'Hospital payments': {
    title: 'Hospital Payments',
    description: 'Payment terms → clinic record in LMS.',
    activityType: 'payment',
    fields: [
      { key: 'hospitalName', label: 'Hospital', required: true },
      { key: 'paymentAmount', label: 'Payment Amount (₹)', type: 'number' },
      { key: 'paymentDate', label: 'Payment Date', type: 'date' },
      { key: 'remarks', label: 'Remarks', type: 'textarea' },
    ],
  },
  'User comments': {
    title: 'User Comments',
    description: 'Comments attached to lead in LMS.',
    activityType: 'operations',
    fields: [...leadRefFields, { key: 'remarks', label: 'Comment', type: 'textarea', required: true }],
  },
  Enquiries: {
    title: 'Enquiries (Operations)',
    description: 'Ops enquiry → LMS Leads.',
    activityType: 'enquiry',
    fields: [...leadRefFields, { key: 'enquiryType', label: 'Type' }],
  },
}

const lenderMenus = ['Lender1 application', 'Lender2 application', 'Lender3 application', 'Lender4 application', 'Lender5 application']
lenderMenus.forEach((menu, i) => {
  LOS_MENU_META[menu] = {
    title: menu,
    description: `Lender ${i + 1} application syncs to LMS lender approval reports.`,
    activityType: 'lender',
    fields: [
      ...leadRefFields,
      { key: 'lenderCode', label: 'Lender', type: 'select', options: [`LENDER${i + 1}`, `Lender ${i + 1}`], required: true },
      { key: 'lenderStatus', label: 'Application Status', type: 'select', options: ['PENDING', 'APPROVED', 'REJECTED'] },
      { key: 'approvedAmount', label: 'Approved Amount (₹ Lakh)', type: 'number' },
    ],
  }
})

export function getMenuMeta(menu: string): LosMenuMeta {
  return (
    LOS_MENU_META[menu] ?? {
      title: menu,
      description: 'Data syncs to Trustiva LMS for live reports.',
      activityType: 'operations',
      fields: [
        { key: 'hospitalName', label: 'Hospital / Reference' },
        { key: 'patientName', label: 'Patient / Subject' },
        { key: 'remarks', label: 'Details', type: 'textarea' },
      ],
    }
  )
}
