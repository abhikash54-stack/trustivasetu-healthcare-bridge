import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { validateEmail } from '../../utils/validators';
import {
  signupWithEmail,
  sendSignupOtp,
  verifySignupOtp,
  loginWithEmail,
  forgotPassword,
  sendLoginOtp,
  verifyLoginOtp,
} from '../../services/customerAuthService';

type Mode = 'login' | 'signup';
type Method = 'email' | 'phone';
type PhoneStep = 'enter' | 'otp';

export function CustomerLoginScreen() {
  const navigation = useNavigation<any>();

  const [mode, setMode] = useState<Mode>('login');
  const [method, setMethod] = useState<Method>('email');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  function resetPhoneFlow() {
    setPhoneStep('enter');
    setOtp('');
  }

  function switchMode(next: Mode) {
    setMode(next);
    resetPhoneFlow();
  }

  function switchMethod(next: Method) {
    setMethod(next);
    resetPhoneFlow();
  }

  function goToDashboard(token: string, customer: any) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerDashboard', params: { token, customer } }],
    });
  }

  function handlePostLoginFlow(token: string, customer: any, response: any) {
    const requiresPasswordReset = Boolean(
      response?.requiresPasswordReset || response?.forcePasswordReset || response?.firstLogin || response?.isTemporaryPassword,
    );
    const requiresProfileCompletion = Boolean(
      response?.requiresProfileCompletion || response?.profileIncomplete,
    );

    if (requiresPasswordReset) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerChangePassword', params: { token, customer } }],
      });
      return;
    }

    if (requiresProfileCompletion) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerProfileCompletion', params: { token, customer } }],
      });
      return;
    }

    goToDashboard(token, customer);
  }

  async function handleForgotPassword() {
    if (!validateEmail(email)) {
      return Alert.alert('Enter your email', 'Type your registered email above first, then tap "Forgot password?" again.');
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      Alert.alert('Check your email', res.message);
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit() {
    if (!validateEmail(email)) return Alert.alert('Invalid email', 'Enter a valid email address.');

    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setLoading(false);
          return Alert.alert('Required', 'Enter your full name.');
        }
        const res = await signupWithEmail(name.trim(), email.trim());
        Alert.alert('Account created', res.message, [
          { text: 'OK', onPress: () => handlePostLoginFlow(res.token, res.customer, res) },
        ]);
      } else {
        if (!password) {
          setLoading(false);
          return Alert.alert('Required', 'Enter your password.');
        }
        const res = await loginWithEmail(email.trim(), password);
        handlePostLoginFlow(res.token, res.customer, res);
      }
    } catch (err: any) {
      Alert.alert(mode === 'signup' ? 'Signup failed' : 'Login failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneSendOtp() {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return Alert.alert('Invalid phone', 'Enter a valid 10-digit mobile number.');
    if (mode === 'signup' && !name.trim()) return Alert.alert('Required', 'Enter your full name.');

    setLoading(true);
    try {
      if (mode === 'signup') {
        await sendSignupOtp(cleanPhone);
      } else {
        await sendLoginOtp(cleanPhone);
      }
      setPhoneStep('otp');
    } catch (err: any) {
      Alert.alert('Could not send OTP', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneVerify() {
    if (otp.length < 4) return Alert.alert('Invalid OTP', 'Enter the OTP you received.');
    const cleanPhone = phone.replace(/\D/g, '');

    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await verifySignupOtp(name.trim(), cleanPhone, otp);
        handlePostLoginFlow(res.token, res.customer, res);
      } else {
        const res = await verifyLoginOtp(cleanPhone, otp);
        handlePostLoginFlow(res.token, res.customer, res);
      }
    } catch (err: any) {
      Alert.alert('Verification failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>{mode === 'login' ? 'Patient Sign In' : 'Create Your Account'}</Text>
        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Check your loan status, EMI details and documents.'
            : 'Sign up to track your treatment financing anytime.'}
        </Text>

        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentBtn, mode === 'login' && styles.segmentBtnActive]}
            onPress={() => switchMode('login')}
          >
            <Text style={[styles.segmentText, mode === 'login' && styles.segmentTextActive]}>Sign In</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, mode === 'signup' && styles.segmentBtnActive]}
            onPress={() => switchMode('signup')}
          >
            <Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>Sign Up</Text>
          </Pressable>
        </View>

        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentBtn, method === 'email' && styles.segmentBtnActive]}
            onPress={() => switchMethod('email')}
          >
            <Text style={[styles.segmentText, method === 'email' && styles.segmentTextActive]}>Email</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, method === 'phone' && styles.segmentBtnActive]}
            onPress={() => switchMethod('phone')}
          >
            <Text style={[styles.segmentText, method === 'phone' && styles.segmentTextActive]}>Mobile</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {method === 'email' ? (
            <>
              {mode === 'signup' && (
                <FormInput label="Full Name" placeholder="Your name" value={name} onChangeText={setName} />
              )}
              <FormInput
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {mode === 'login' && (
                <>
                  <FormInput
                    label="Password"
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Text style={styles.forgotLink} onPress={handleForgotPassword}>
                    Forgot password?
                  </Text>
                </>
              )}
              {mode === 'signup' && (
                <Text style={styles.helperText}>
                  We&apos;ll email you a password to sign in with — no need to create one.
                </Text>
              )}
              <PrimaryButton
                label={loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                onPress={handleEmailSubmit}
                disabled={loading}
              />
            </>
          ) : (
            <>
              {phoneStep === 'enter' ? (
                <>
                  {mode === 'signup' && (
                    <FormInput label="Full Name" placeholder="Your name" value={name} onChangeText={setName} />
                  )}
                  <FormInput
                    label="Mobile Number"
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                  <PrimaryButton
                    label={loading ? 'Sending...' : 'Send OTP'}
                    onPress={handlePhoneSendOtp}
                    disabled={loading}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.helperText}>OTP sent to {phone}</Text>
                  <FormInput
                    label="Enter OTP"
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                  />
                  <PrimaryButton
                    label={loading ? 'Verifying...' : 'Verify & Continue'}
                    onPress={handlePhoneVerify}
                    disabled={loading}
                  />
                  <Text style={styles.resendText} onPress={resetPhoneFlow}>
                    Change number / resend OTP
                  </Text>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BRAND.background },
  container: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 60,
  },
  backText: {
    fontSize: 16,
    color: BRAND.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2D1E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#5A7A63',
    marginBottom: 20,
    lineHeight: 19,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#E4EFE8',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A7A63',
  },
  segmentTextActive: {
    color: BRAND.primaryDark,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
  helperText: {
    fontSize: 12.5,
    color: '#5A7A63',
    marginBottom: 14,
    lineHeight: 18,
  },
  forgotLink: {
    fontSize: 13,
    color: BRAND.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 14,
    marginTop: -6,
  },
  resendText: {
    fontSize: 13,
    color: BRAND.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 14,
  },
});
