import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/core';
import { useMutation } from '@tanstack/react-query';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { completeCustomerProfile, CustomerProfile } from '../../services/customerAuthService';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';

export function CustomerProfileCompletionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token, customer } = route.params ?? {};

  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');

  const isReady = useMemo(() => Boolean(token), [token]);

  const { mutate: submitProfile, isPending } = useMutation({
    mutationFn: () => completeCustomerProfile(token, { state, city, area, pincode }),
    onSuccess: () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerDashboard', params: { token, customer } }],
      });
    },
    onError: (error: any) => {
      Alert.alert('Could not save profile', error?.message ?? 'Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!isReady) {
      return Alert.alert('Session expired', 'Please sign in again to continue.');
    }
    if (!state.trim()) return Alert.alert('Required', 'Enter your state.');
    if (!city.trim()) return Alert.alert('Required', 'Enter your city.');
    if (!area.trim()) return Alert.alert('Required', 'Enter your area or locality.');
    submitProfile();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text variant="header" marginBottom="md">Complete your profile</Text>
          <Text variant="body" marginBottom="lg">
            To continue, tell us the location where you’ll be using the service.
          </Text>

          <FormInput label="State" placeholder="e.g. Karnataka" value={state} onChangeText={setState} />
          <FormInput label="City" placeholder="e.g. Bengaluru" value={city} onChangeText={setCity} />
          <FormInput label="Area / Locality" placeholder="e.g. Koramangala" value={area} onChangeText={setArea} />
          <FormInput label="Pincode (optional)" placeholder="560001" value={pincode} onChangeText={setPincode} />

          <PrimaryButton
            label={isPending ? 'Saving...' : 'Continue'}
            onPress={handleSubmit}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BRAND.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
});
