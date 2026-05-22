import { lmsStatusFromLead } from './status-engine'
import type { Lead } from './types'
import {
  syncActivityToLMS,
  syncClinicToLMS,
  syncCommercialToLMS,
  syncEnquiryToLMS,
  syncUserToLMS,
} from '../los-client'

export { syncUserToLMS, syncClinicToLMS, syncCommercialToLMS, syncEnquiryToLMS, syncActivityToLMS }

export async function syncLeadToLms(lead: Lead) {
  return syncEnquiryToLMS(
    {
      ...lead.form,
      patientName: lead.applicantName,
      mobileNumber: lead.mobileNumber,
      hospitalName: lead.hospitalName,
      status: lmsStatusFromLead(lead.status),
      medicalEstimate: lead.estimateAmount,
      financingRequired: lead.form.financingRequired,
      approvedAmount: lead.approvedAmount,
      disbursedAmount: lead.disbursedAmount,
    },
    {
      losEnquiryId: lead.losEnquiryId,
      currentAddress: lead.currentAddress,
      permanentAddress: lead.permanentAddress,
      officeAddress: lead.officeAddress,
    }
  )
}
