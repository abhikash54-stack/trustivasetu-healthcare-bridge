import { apiClient } from '../api/axios';
import { Enquiry, EnquiryDetail } from '../types/auth';

const sampleEnquiries: Enquiry[] = [
  {
    id: '1',
    title: 'Invoice reconciliation',
    status: 'Pending',
    patientName: 'Deepa',
    requestedAt: 'Today',
  },
  {
    id: '2',
    title: 'Payment approval',
    status: 'In progress',
    patientName: 'Arjun',
    requestedAt: 'Yesterday',
  },
  {
    id: '3',
    title: 'Clinic onboarding',
    status: 'Completed',
    patientName: 'Sunita',
    requestedAt: '2 days ago',
  },
];

const sampleEnquiryDetails: EnquiryDetail[] = [
  {
    id: '1',
    title: 'Invoice reconciliation',
    status: 'Pending',
    patientName: 'Deepa',
    requestedAt: 'Today',
    clinicName: 'Vertex Care Clinic',
    enquiryType: 'Billing',
    hospitalName: 'Vertex Care Clinic',
    mobileNumber: '+91 98765 43210',
    treatmentName: 'Orthopedic surgery',
    financingRequired: '₹420,000',
    remarks: 'Pending insurance validation and patient consent form.',
    referenceId: 'ENQ-1024',
  },
  {
    id: '2',
    title: 'Payment approval',
    status: 'In progress',
    patientName: 'Arjun',
    requestedAt: 'Yesterday',
    clinicName: 'Swasthya Partners',
    enquiryType: 'Payment',
    hospitalName: 'Swasthya Partners',
    mobileNumber: '+91 91234 56789',
    treatmentName: 'Cardiac diagnostics',
    financingRequired: '₹95,000',
    remarks: 'Approval pending from corporate finance team.',
    referenceId: 'ENQ-1088',
  },
  {
    id: '3',
    title: 'Clinic onboarding',
    status: 'Completed',
    patientName: 'Sunita',
    requestedAt: '2 days ago',
    clinicName: 'Niramaya Health Hub',
    enquiryType: 'Onboarding',
    hospitalName: 'Niramaya Health Hub',
    mobileNumber: '+91 99887 77665',
    treatmentName: 'Routine checkup',
    financingRequired: '₹0',
    remarks: 'Onboarding completed; clinic is ready for financing workflows.',
    referenceId: 'ENQ-1102',
  },
];

export async function fetchEnquiries(): Promise<Enquiry[]> {
  try {
    const response = await apiClient.get('/los/sync/enquiry');
    return response.data as Enquiry[];
  } catch (error) {
    return sampleEnquiries;
  }
}

export async function fetchEnquiryById(enquiryId: string): Promise<EnquiryDetail> {
  try {
    const response = await apiClient.get(`/los/sync/enquiry/${enquiryId}`);
    return response.data as EnquiryDetail;
  } catch (error) {
    return sampleEnquiryDetails.find((item) => item.id === enquiryId) ?? sampleEnquiryDetails[0];
  }
}
