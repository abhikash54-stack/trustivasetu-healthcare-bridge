import { apiClient } from '../api/axios';

export interface ChannelPartnerOnboardingInput {
  name: string;
  mobile: string;
  clinicName: string;
  city: string;
  specialty: string;
  registrationDocName?: string;
  idProofDocName?: string;
  agreementAccepted: boolean;
}

export interface ChannelPartnerOnboardingResult {
  id: string;
  status: string;
}

/**
 * Submits a new channel-partner onboarding application to the LMS so it appears
 * in the admin panel for review.
 *
 * TODO(backend): confirm the production endpoint + payload. The mobile app posts
 * to `/channel-partners/onboarding`; if that route is not yet live it falls back
 * to `/clinics` with a PENDING status so the application still lands in the LMS.
 */
export async function submitChannelPartnerOnboarding(
  input: ChannelPartnerOnboardingInput,
): Promise<ChannelPartnerOnboardingResult> {
  const payload = {
    name: input.name.trim(),
    contactPerson: input.name.trim(),
    contactNumber: input.mobile.trim(),
    mobile: input.mobile.trim(),
    clinicName: input.clinicName.trim(),
    address: input.city.trim(),
    city: input.city.trim(),
    specialty: input.specialty.trim(),
    documents: {
      registration: input.registrationDocName ?? null,
      idProof: input.idProofDocName ?? null,
    },
    agreementAccepted: input.agreementAccepted,
    status: 'PENDING',
    source: 'TrustivaSetu app onboarding',
  };

  try {
    const response = await apiClient.post('/channel-partners/onboarding', payload);
    const raw = response.data?.data ?? response.data ?? {};
    return { id: raw.id ?? '', status: raw.status ?? 'PENDING' };
  } catch (error: any) {
    // If the dedicated onboarding route is unavailable (404), fall back to the
    // clinic-onboarding endpoint so the application is still captured in the LMS.
    if (error?.response?.status === 404) {
      const response = await apiClient.post('/clinics', {
        name: input.clinicName.trim() || input.name.trim(),
        contactPerson: input.name.trim(),
        contactNumber: input.mobile.trim(),
        address: input.city.trim(),
        status: 'PENDING',
      });
      const raw = response.data?.data ?? response.data ?? {};
      return { id: raw.id ?? '', status: raw.status ?? 'PENDING' };
    }
    throw error;
  }
}
