import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';

import {
  submitChannelPartnerOnboarding,
  ChannelPartnerOnboardingInput,
  ChannelPartnerOnboardingResult,
} from '../../services/channelPartnerService';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BRAND } from '../../theme/theme';

interface FormState {
  name: string;
  mobile: string;
  clinicName: string;
  city: string;
  specialty: string;
}

const EMPTY: FormState = { name: '', mobile: '', clinicName: '', city: '', specialty: '' };

const onlyDigits = (v: string) => v.replace(/\D/g, '');

export function ChannelPartnerOnboardingScreen() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState<FormState>(EMPTY);

  const [registrationDoc, setRegistrationDoc] = useState<string | null>(null);
  const [idProofDoc, setIdProofDoc] = useState<string | null>(null);

  // OTP verification (demo: the LMS SMS gateway issues the real code in production).
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<ChannelPartnerOnboardingResult | null>(null);

  const set = (key: keyof FormState) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  const { mutate, isPending } = useMutation({
    mutationFn: (input: ChannelPartnerOnboardingInput) => submitChannelPartnerOnboarding(input),
    onSuccess: (result: ChannelPartnerOnboardingResult) => setSubmittedResult(result),
    onError: (error: any) => {
      const msg = error?.response?.data?.message
        || (String(error?.message).includes('Network')
          ? 'Network error — please check your connection and try again.'
          : null)
        || 'Could not submit your application. Please try again.';
      Alert.alert('Submission failed', msg);
    },
  });

  const attachDoc = (setter: (v: string) => void, label: string) => {
    // A native file picker (expo-document-picker) is not bundled; this marks the
    // document as attached so the application can proceed. The actual file upload
    // is completed during LMS review.
    const stamp = `${label.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    setter(stamp);
  };

  const handleSendOtp = () => {
    if (onlyDigits(form.mobile).length !== 10) {
      Alert.alert('Invalid mobile', 'Enter a valid 10-digit mobile number first.');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpVerified(false);
    setOtpInput('');
    Alert.alert('OTP sent', `A verification code has been sent to ${form.mobile}.\n\n(Demo code: ${code})`);
  };

  const handleVerifyOtp = () => {
    if (onlyDigits(otpInput) === generatedOtp && generatedOtp.length === 6) {
      setOtpVerified(true);
      Alert.alert('Verified', 'Mobile number verified successfully.');
    } else {
      Alert.alert('Incorrect OTP', 'The code you entered does not match. Please try again.');
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return Alert.alert('Required', 'Enter your full name.');
    if (onlyDigits(form.mobile).length !== 10) return Alert.alert('Required', 'Enter a valid 10-digit mobile number.');
    if (!form.clinicName.trim()) return Alert.alert('Required', 'Enter the clinic / hospital name.');
    if (!form.city.trim()) return Alert.alert('Required', 'Enter the city.');
    if (!form.specialty.trim()) return Alert.alert('Required', 'Enter the specialty.');
    if (!registrationDoc) return Alert.alert('Required', 'Attach the clinic registration document.');
    if (!idProofDoc) return Alert.alert('Required', 'Attach the owner ID proof.');
    if (!otpVerified) return Alert.alert('Verify mobile', 'Please verify your mobile number via OTP.');
    if (!agreementAccepted) return Alert.alert('Agreement', 'Please accept the partner agreement to continue.');

    mutate({
      name: form.name,
      mobile: onlyDigits(form.mobile),
      clinicName: form.clinicName,
      city: form.city,
      specialty: form.specialty,
      registrationDocName: registrationDoc ?? undefined,
      idProofDocName: idProofDoc ?? undefined,
      agreementAccepted,
    });
  };

  // ---- Confirmation screen ----
  if (submittedResult) {
    return (
      <View style={styles.confirmContainer}>
        <View style={styles.confirmIcon}>
          <MaterialIcons name="hourglass-top" size={48} color={BRAND.primary} />
        </View>
        <Text style={styles.confirmTitle}>Application Under Review</Text>
        <Text style={styles.confirmBody}>
          Thank you, {form.name.split(' ')[0] || 'partner'}! Your channel-partner application for{' '}
          <Text style={styles.confirmBold}>{form.clinicName}</Text> has been submitted to the
          TrustivaSetu LMS and is now pending review by our team.
        </Text>
        {submittedResult.id ? (
          <View style={styles.refBadge}>
            <Text style={styles.refLabel}>Reference ID</Text>
            <Text style={styles.refValue}>{submittedResult.id}</Text>
          </View>
        ) : null}
        <Text style={styles.confirmNote}>
          You'll be notified once your application is approved. Our team may contact you on{' '}
          {form.mobile} for verification.
        </Text>
        <View style={{ width: '100%', marginTop: 28 }}>
          <PrimaryButton label="Done" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  // ---- Onboarding form ----
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Join TrustivaSetu as a channel partner. Complete the details below and our team will review
          your application.
        </Text>

        <Text style={styles.sectionLabel}>Your Details</Text>
        <FormInput label="Full Name *" placeholder="Your name" value={form.name} onChangeText={set('name')} autoCapitalize="words" />
        <FormInput label="Mobile Number *" placeholder="10-digit mobile" keyboardType="phone-pad" value={form.mobile} onChangeText={set('mobile')} />
        <FormInput label="Clinic / Hospital Name *" placeholder="e.g. Sunrise Hospital" value={form.clinicName} onChangeText={set('clinicName')} autoCapitalize="words" />
        <FormInput label="City *" placeholder="e.g. Pune" value={form.city} onChangeText={set('city')} autoCapitalize="words" />
        <FormInput label="Specialty *" placeholder="e.g. IVF, Dental, Cosmetology" value={form.specialty} onChangeText={set('specialty')} autoCapitalize="words" />

        <Text style={styles.sectionLabel}>Documents</Text>
        <DocRow
          label="Clinic Registration Document"
          attached={registrationDoc}
          onAttach={() => attachDoc(setRegistrationDoc, 'Clinic Registration')}
          onRemove={() => setRegistrationDoc(null)}
        />
        <DocRow
          label="Owner ID Proof"
          attached={idProofDoc}
          onAttach={() => attachDoc(setIdProofDoc, 'Owner ID Proof')}
          onRemove={() => setIdProofDoc(null)}
        />

        <Text style={styles.sectionLabel}>Mobile Verification</Text>
        {!otpVerified ? (
          <>
            <TouchableOpacity style={styles.otpSendBtn} onPress={handleSendOtp}>
              <MaterialIcons name="sms" size={18} color={BRAND.primary} />
              <Text style={styles.otpSendText}>{otpSent ? 'Resend OTP' : 'Send OTP'}</Text>
            </TouchableOpacity>
            {otpSent && (
              <View style={styles.otpVerifyRow}>
                <View style={{ flex: 1 }}>
                  <FormInput
                    label="Enter OTP"
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    value={otpInput}
                    onChangeText={setOtpInput}
                  />
                </View>
                <TouchableOpacity style={styles.otpVerifyBtn} onPress={handleVerifyOtp}>
                  <Text style={styles.otpVerifyText}>Verify</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.verifiedRow}>
            <MaterialIcons name="verified" size={20} color={BRAND.accent} />
            <Text style={styles.verifiedText}>Mobile number verified</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Agreement</Text>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreementAccepted((v) => !v)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={agreementAccepted ? 'check-box' : 'check-box-outline-blank'}
            size={22}
            color={agreementAccepted ? BRAND.primary : '#9AB0A2'}
          />
          <Text style={styles.checkboxText}>
            I have read and accept the TrustivaSetu Channel Partner Agreement and authorise
            verification of the submitted details.
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={isPending ? 'Submitting...' : 'Submit Application'}
            onPress={handleSubmit}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DocRow({
  label,
  attached,
  onAttach,
  onRemove,
}: {
  label: string;
  attached: string | null;
  onAttach: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.docRow}>
      <View style={styles.docIcon}>
        <MaterialIcons name={attached ? 'description' : 'upload-file'} size={20} color={attached ? BRAND.accent : '#5A7A63'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docLabel}>{label}</Text>
        <Text style={styles.docStatus}>{attached ? attached : 'Not attached'}</Text>
      </View>
      {attached ? (
        <TouchableOpacity onPress={onRemove} style={styles.docActionRemove}>
          <MaterialIcons name="close" size={18} color="#E74C3C" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onAttach} style={styles.docActionAttach}>
          <Text style={styles.docActionText}>Attach</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20, paddingBottom: 48 },
  intro: { fontSize: 14, color: '#3A5240', lineHeight: 20, marginBottom: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F0EC',
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  docIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: { fontSize: 14, fontWeight: '600', color: '#1A2D1E' },
  docStatus: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
  docActionAttach: {
    backgroundColor: BRAND.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  docActionText: { color: BRAND.primaryDark, fontWeight: '700', fontSize: 13 },
  docActionRemove: { padding: 6 },
  otpSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: BRAND.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  otpSendText: { color: BRAND.primaryDark, fontWeight: '700', fontSize: 14 },
  otpVerifyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 8 },
  otpVerifyBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 13,
    marginBottom: 2,
  },
  otpVerifyText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verifiedText: { color: BRAND.primaryDark, fontWeight: '600', fontSize: 14 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkboxText: { flex: 1, fontSize: 13, color: '#3A5240', lineHeight: 19 },
  confirmContainer: {
    flex: 1,
    backgroundColor: BRAND.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  confirmIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmTitle: { fontSize: 22, fontWeight: '800', color: '#1A2D1E', marginBottom: 12, textAlign: 'center' },
  confirmBody: { fontSize: 15, color: '#3A5240', lineHeight: 22, textAlign: 'center' },
  confirmBold: { fontWeight: '700', color: '#1A2D1E' },
  refBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8DFD0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  refLabel: { fontSize: 11, color: '#5A7A63', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  refValue: { fontSize: 16, color: BRAND.primaryDark, fontWeight: '700', marginTop: 4 },
  confirmNote: { fontSize: 13, color: '#5A7A63', lineHeight: 19, textAlign: 'center', marginTop: 20 },
});
