import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Text, Box } from '../../theme/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { FormInput } from '../../components/FormInput';
import { apiClient } from '../../api/axios';
import { BRAND } from '../../theme/theme';

interface RMAssignmentScreenProps {
  route: { params: { clinicId: string } };
}

async function assignRM(clinicId: string, rmName: string): Promise<void> {
  await apiClient.put(`/clinics/${clinicId}/assign-rm`, { rmName });
}

export function RMAssignmentScreen({ route }: RMAssignmentScreenProps) {
  const { clinicId } = route.params;
  const [assigneeName, setAssigneeName] = useState('');
  const navigation = useNavigation<any>();

  const { mutate: submitAssign, isPending } = useMutation({
    mutationFn: () => assignRM(clinicId, assigneeName.trim()),
    onSuccess: () => {
      Alert.alert(
        'RM Assigned',
        `${assigneeName.trim()} has been assigned to clinic ${clinicId}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    },
    onError: (error: any) => {
      const message: string =
        error?.response?.data?.message ?? 'Could not assign RM. Please try again.';
      Alert.alert('Assignment failed', message);
    },
  });

  const handleAssign = () => {
    if (!assigneeName.trim()) {
      return Alert.alert('Required', 'Enter a regional manager name or ID.');
    }
    submitAssign();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text variant="body" marginBottom="lg">
        Assign the regional manager responsible for clinic operations and financing workflows.
      </Text>
      <Box backgroundColor="surface" borderRadius="m" padding="md" marginBottom="lg">
        <FormInput label="Clinic ID" value={clinicId} editable={false} />
        <FormInput
          label="Regional manager name"
          placeholder="Enter RM name or employee ID"
          value={assigneeName}
          onChangeText={setAssigneeName}
        />
      </Box>
      <PrimaryButton
        label={isPending ? 'Assigning...' : 'Assign RM'}
        onPress={handleAssign}
        disabled={isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: BRAND.background,
  },
});
