import axios from 'axios';
import { ENV } from '../config/environment';

const http = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
}) as any;

export interface CustomerProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  state?: string | null;
  city?: string | null;
  area?: string | null;
  pincode?: string | null;
}

export interface CustomerLead {
  id: string;
  applicantName: string;
  status: string;
  approvedAmount: number | null;
  emiAmount: number | null;
  emiCount: number | null;
  kfsToken: string | null;
  clinic: { name: string };
}

export interface CustomerAuthResponse {
  success: true;
  token: string;
  customer: CustomerProfile;
  message?: string;
  requiresPasswordReset?: boolean;
  forcePasswordReset?: boolean;
  firstLogin?: boolean;
  isTemporaryPassword?: boolean;
  requiresProfileCompletion?: boolean;
  profileIncomplete?: boolean;
}

export interface CustomerProfileCompletionInput {
  state: string;
  city: string;
  area: string;
  pincode?: string;
}

function extractErrorMessage(err: any, fallback: string): string {
  return err?.response?.data?.error ?? err?.message ?? fallback;
}

export async function signupWithEmail(name: string, email: string) {
  try {
    const res = await http.post('/public/customer/signup/email', { name, email });
    return res.data as { success: true; token: string; customer: CustomerProfile; message: string };
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, 'Signup failed. Please try again.'));
  }
}

export async function sendSignupOtp(phone: string) {
  try {
    await http.post('/public/customer/signup/phone/send-otp', { phone });
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, 'Could not send OTP. Please try again.'));
  }
}

export async function verifySignupOtp(name: string, phone: string, otp: string) {
  try {
    const res = await http.post('/public/customer/signup/phone/verify', { name, phone, otp });
    return res.data as { success: true; token: string; customer: CustomerProfile };
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, 'Verification failed. Please try again.'));
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const res = await http.post('/public/customer/login/email', { email, password });
    return res.data as CustomerAuthResponse;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, 'Login failed. Please try again.'));
  }
}

export async function forgotPassword(email: string) {
  try {
    const res = await http.post('/public/customer/forgot-password', { email });
    return res.data as { success: true; message: string };
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, 'Could not process request. Please try again.'));
  }
}

export async function sendLoginOtp(phone: string) {
  try {
    await http.post('/public/customer/login/phone/send-otp', { phone });
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, 'Could not send OTP. Please try again.'));
  }
}

export async function verifyLoginOtp(phone: string, otp: string) {
  try {
    const res = await http.post('/public/customer/login/phone/verify', { phone, otp });
    return res.data as CustomerAuthResponse;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, 'Verification failed. Please try again.'));
  }
}

export async function changeCustomerPassword(token: string, currentPassword: string, newPassword: string) {
  try {
    const res = await http.post(
      '/public/customer/change-password',
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data as { success: true; message: string };
  } catch (err: any) {
    // TODO: backend should return an explicit force-password-reset response and verify the current password.
    throw new Error(extractErrorMessage(err, 'Could not update password. Please try again.'));
  }
}

export async function completeCustomerProfile(token: string, payload: CustomerProfileCompletionInput) {
  try {
    const res = await http.post(
      '/public/customer/profile/complete',
      payload,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data as { success: true; message: string };
  } catch (err: any) {
    // TODO: backend should return profile completion status and persist state/city/area/pincode.
    throw new Error(extractErrorMessage(err, 'Could not save profile. Please try again.'));
  }
}

export async function fetchCustomerMe(token: string) {
  try {
    const res = await http.get('/public/customer/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as { customer: CustomerProfile; leads: CustomerLead[] };
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, 'Could not load profile.'));
  }
}

export async function customerLogout(token: string) {
  try {
    await http.post(
      '/public/customer/logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch {
    // Best effort — caller clears local state regardless.
  }
}
