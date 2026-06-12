import { apiClient } from '../api/axios';
import { Lead, LeadDetail } from '../types/auth';

const sampleLeads: Lead[] = [
  {
    id: '1',
    applicantName: 'Nisha Rao',
    clinicName: 'Vertex Care Clinic',
    status: 'PENDING',
    assignedTo: 'Asha Patel',
    updatedAt: '2h ago',
    amount: '₹420,000',
    source: 'Referral',
  },
  {
    id: '2',
    applicantName: 'Rajiv Kumar',
    clinicName: 'Swasthya Partners',
    status: 'APPROVED',
    assignedTo: 'Neha Sharma',
    updatedAt: '5h ago',
    amount: '₹1,250,000',
    source: 'Clinic',
  },
  {
    id: '3',
    applicantName: 'Mira Singh',
    clinicName: 'Niramaya Health Hub',
    status: 'DISBURSED',
    assignedTo: 'Vikram Patel',
    updatedAt: '1d ago',
    amount: '₹760,000',
    source: 'Website',
  },
];

const sampleLeadDetails: LeadDetail[] = [
  {
    id: '1',
    applicantName: 'Nisha Rao',
    clinicName: 'Vertex Care Clinic',
    status: 'PENDING',
    assignedTo: 'Asha Patel',
    updatedAt: '2h ago',
    amount: '₹420,000',
    source: 'Referral',
    phone: '+91 98765 43210',
    email: 'nisha.rao@example.com',
    approvedAmount: '₹0',
    disbursedAmount: '₹0',
    applicationDate: '2026-06-08',
    approvalDate: '-',
    disbursalDate: '-',
    remarks: 'Patient needs immediate cashless approval for orthopedic care.',
    lenderName: 'MediCredit Bank',
    stage: 'Credit review',
    statusHistory: [
      { status: 'PENDING', updatedAt: '2h ago', note: 'New enquiry received' },
    ],
  },
  {
    id: '2',
    applicantName: 'Rajiv Kumar',
    clinicName: 'Swasthya Partners',
    status: 'APPROVED',
    assignedTo: 'Neha Sharma',
    updatedAt: '5h ago',
    amount: '₹1,250,000',
    source: 'Clinic',
    phone: '+91 91234 56789',
    email: 'rajiv.kumar@example.com',
    approvedAmount: '₹1,100,000',
    disbursedAmount: '₹0',
    applicationDate: '2026-06-05',
    approvalDate: '2026-06-10',
    disbursalDate: '-',
    remarks: 'Pre-approved for surgical financing. Awaiting final documentation.',
    lenderName: 'HealthFund Finance',
    stage: 'Approved',
    statusHistory: [
      { status: 'PENDING', updatedAt: '3d ago', note: 'Initial enquiry created' },
      { status: 'APPROVED', updatedAt: '5h ago', note: 'Credit decision completed' },
    ],
  },
  {
    id: '3',
    applicantName: 'Mira Singh',
    clinicName: 'Niramaya Health Hub',
    status: 'DISBURSED',
    assignedTo: 'Vikram Patel',
    updatedAt: '1d ago',
    amount: '₹760,000',
    source: 'Website',
    phone: '+91 99887 77665',
    email: 'mira.singh@example.com',
    approvedAmount: '₹760,000',
    disbursedAmount: '₹760,000',
    applicationDate: '2026-05-29',
    approvalDate: '2026-06-02',
    disbursalDate: '2026-06-09',
    remarks: 'Disbursed for critical care treatment.',
    lenderName: 'CareValue Finance',
    stage: 'Disbursed',
    statusHistory: [
      { status: 'APPROVED', updatedAt: '4d ago', note: 'Sanction received' },
      { status: 'DISBURSED', updatedAt: '1d ago', note: 'Funds released to clinic' },
    ],
  },
];

export async function fetchLeads(): Promise<Lead[]> {
  try {
    const response = await apiClient.get('/leads');
    return response.data as Lead[];
  } catch (error) {
    return sampleLeads;
  }
}

export async function fetchLeadById(leadId: string): Promise<LeadDetail> {
  try {
    const response = await apiClient.get(`/leads/${leadId}`);
    return response.data as LeadDetail;
  } catch (error) {
    return sampleLeadDetails.find((lead) => lead.id === leadId) ?? sampleLeadDetails[0];
  }
}
