import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { createBox, createText } from '@shopify/restyle';

import { AppStackParamList } from '../../types/navigation';
import { Theme } from '../../theme/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { FormInput } from '../../components/FormInput';

const Box = createBox<Theme>();
const Text = createText<Theme>();

type RMAssignmentRouteProp = any;

interface RMAssignmentScreenProps {
  route: { params: { clinicId: string } };
}

export function RMAssignmentScreen({ route }: RMAssignmentScreenProps) {
  const { clinicId } = route.params;
  const [assigneeName, setAssigneeName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = () => {
    if (!assigneeName.trim()) {
      return Alert.alert('Enter RM name', 'Provide a regional manager name to assign this clinic.');
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Assigned', `Clinic ${clinicId} is now assigned to ${assigneeName}.`);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Assign RM
      </Text>
      <Text variant="body" marginBottom="lg">
        Assign the regional manager responsible for clinic operations and financing workflows.
      </Text>
      <Box backgroundColor="surface" borderRadius="m" padding="md" marginBottom="lg">
        <FormInput label="Clinic ID" value={clinicId} editable={false} />
        <FormInput label="Regional manager name" placeholder="Enter RM name" value={assigneeName} onChangeText={setAssigneeName} />
      </Box>
      <PrimaryButton label={loading ? 'Assigning...' : 'Assign RM'} onPress={handleAssign} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F9FF',
  },
});
