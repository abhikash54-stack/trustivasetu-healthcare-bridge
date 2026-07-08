import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { FormInput } from './FormInput';
import { PrimaryButton } from './PrimaryButton';
import { Text } from '../theme/theme';
import { BRAND } from '../theme/theme';
import { assignHospitalAccess, HospitalRecord } from '../services/hospitalService';

interface HospitalAccessFlowProps {
  token: string;
  hospital?: HospitalRecord | null;
  onAssigned?: () => void;
}

export function HospitalAccessFlow({ token, hospital, onAssigned }: HospitalAccessFlowProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'invite' | 'qr'>('invite');

  const canSubmit = useMemo(() => Boolean(hospital?.id) && (mode === 'invite' ? inviteCode.trim().length > 0 : true), [hospital?.id, inviteCode, mode]);

  const handleSubmit = async () => {
    if (!hospital?.id) {
      Alert.alert('Select a hospital', 'Choose a hospital first.');
      return;
    }
    setLoading(true);
    try {
      await assignHospitalAccess(token, { hospitalId: hospital.id, inviteCode: mode === 'invite' ? inviteCode : undefined });
      Alert.alert('Assigned', 'Hospital access has been linked.');
      onAssigned?.();
    } catch (error: any) {
      Alert.alert('Assignment failed', error?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text variant="header" marginBottom="sm">Secure hospital access</Text>
      <Text variant="body" marginBottom="md">
        Use an invite code or QR-based handoff to connect this account to a specific hospital.
      </Text>

      <View style={styles.segment}>
        <Pressable style={[styles.chip, mode === 'invite' && styles.chipActive]} onPress={() => setMode('invite')}>
          <Text style={[styles.chipText, mode === 'invite' && styles.chipTextActive]}>Invite code</Text>
        </Pressable>
        <Pressable style={[styles.chip, mode === 'qr' && styles.chipActive]} onPress={() => setMode('qr')}>
          <Text style={[styles.chipText, mode === 'qr' && styles.chipTextActive]}>QR code</Text>
        </Pressable>
      </View>

      {mode === 'invite' ? (
        <FormInput label="Invite code" placeholder="Enter the code provided by the hospital" value={inviteCode} onChangeText={setInviteCode} />
      ) : (
        <View style={styles.qrPlaceholder}>
          <MaterialIcons name="qr-code-2" size={36} color={BRAND.primary} />
          <Text variant="body">Scan or upload a QR code to verify the hospital assignment.</Text>
        </View>
      )}

      <PrimaryButton label={loading ? 'Assigning...' : 'Assign hospital'} onPress={handleSubmit} disabled={loading || !canSubmit} />
      {loading ? <ActivityIndicator style={{ marginTop: 12 }} color={BRAND.primary} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCEAE1',
    marginTop: 16,
  },
  segment: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F3F7F4',
  },
  chipActive: { backgroundColor: BRAND.primaryLight },
  chipText: { fontSize: 13, fontWeight: '600', color: '#5A7A63' },
  chipTextActive: { color: BRAND.primaryDark },
  qrPlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C8DFD0',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
});
