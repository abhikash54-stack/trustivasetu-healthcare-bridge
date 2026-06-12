import { apiClient } from '../api/axios';
import { Clinic, ClinicDetail } from '../types/auth';

const sampleClinics: Clinic[] = [
  {
    id: '1',
    name: 'Vertex Care Clinic',
    location: 'Mumbai',
    services: ['Diagnostics', 'Telehealth'],
    status: 'Active',
  },
  {
    id: '2',
    name: 'Swasthya Partners',
    location: 'Delhi',
    services: ['Cashless Billing', 'Claims'],
    status: 'Active',
  },
  {
    id: '3',
    name: 'Niramaya Health Hub',
    location: 'Bengaluru',
    services: ['Referral Management', 'Support'],
    status: 'Onboarding',
  },
];

const sampleClinicDetails: ClinicDetail[] = [
  {
    id: '1',
    name: 'Vertex Care Clinic',
    location: 'Mumbai',
    services: ['Diagnostics', 'Telehealth'],
    status: 'Active',
    address: '14 Juhu Road, Andheri West, Mumbai',
    contactPerson: 'Dr. Ravi Shah',
    contactNumber: '+91 99870 12345',
    email: 'ravi.shah@vertexcare.in',
    businessPotential: '₹28M / year',
    assignedRM: 'Asha Patel',
    currentTargets: {
      month: 'June',
      year: 2026,
      leadsTarget: 40,
      disbursalTarget: '₹10M',
      achievedLeads: 18,
      achievedDisbursal: '₹4.9M',
    },
    recentLeads: [
      { id: '1', applicantName: 'Nisha Rao', clinicName: 'Vertex Care Clinic', status: 'PENDING', assignedTo: 'Asha Patel', updatedAt: '2h ago', amount: '₹420,000', source: 'Referral' },
      { id: '4', applicantName: 'Amit Desai', clinicName: 'Vertex Care Clinic', status: 'APPROVED', assignedTo: 'Asha Patel', updatedAt: '1d ago', amount: '₹620,000', source: 'Hospital' },
    ],
    notes: 'Clinic is a priority onboarding partner for orthopedics and cashless claims.',
  },
  {
    id: '2',
    name: 'Swasthya Partners',
    location: 'Delhi',
    services: ['Cashless Billing', 'Claims'],
    status: 'Active',
    address: '72 Nehru Place, New Delhi',
    contactPerson: 'Meera Verma',
    contactNumber: '+91 98976 54321',
    email: 'meera.verma@swasthyapartners.com',
    businessPotential: '₹18M / year',
    assignedRM: 'Neha Sharma',
    currentTargets: {
      month: 'June',
      year: 2026,
      leadsTarget: 30,
      disbursalTarget: '₹7M',
      achievedLeads: 13,
      achievedDisbursal: '₹3.2M',
    },
    recentLeads: [
      { id: '2', applicantName: 'Rajiv Kumar', clinicName: 'Swasthya Partners', status: 'APPROVED', assignedTo: 'Neha Sharma', updatedAt: '5h ago', amount: '₹1,250,000', source: 'Clinic' },
    ],
    notes: 'Strong volume in diagnostics and short-term financing demand.',
  },
  {
    id: '3',
    name: 'Niramaya Health Hub',
    location: 'Bengaluru',
    services: ['Referral Management', 'Support'],
    status: 'Onboarding',
    address: '55 Electronic City Road, Bengaluru',
    contactPerson: 'Rohit Nair',
    contactNumber: '+91 93456 78901',
    email: 'rohit.nair@niramaya.com',
    businessPotential: '₹12M / year',
    assignedRM: 'Vikram Patel',
    currentTargets: {
      month: 'June',
      year: 2026,
      leadsTarget: 25,
      disbursalTarget: '₹5M',
      achievedLeads: 6,
      achievedDisbursal: '₹1.4M',
    },
    recentLeads: [],
    notes: 'Onboarding paperwork is in progress; next step is RM assignment and compliance validation.',
  },
];

export async function fetchClinics(): Promise<Clinic[]> {
  try {
    const response = await apiClient.get('/clinics');
    return response.data as Clinic[];
  } catch (error) {
    return sampleClinics;
  }
}

export async function fetchClinicById(clinicId: string): Promise<ClinicDetail> {
  try {
    const response = await apiClient.get(`/clinics/${clinicId}`);
    return response.data as ClinicDetail;
  } catch (error) {
    return sampleClinicDetails.find((clinic) => clinic.id === clinicId) ?? sampleClinicDetails[0];
  }
}
