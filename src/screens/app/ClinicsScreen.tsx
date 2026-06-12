import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@shopify/restyle';
import { Clinic } from '../../types/auth';
import { SectionCard } from '../../components/SectionCard';
import { AppStackParamList } from '../../types/navigation';

const clinics: Clinic[] = [
  { id: '1', name: 'Vertex Care Clinic', location: 'Mumbai', services: ['Diagnostics', 'Telehealth'] },
  { id: '2', name: 'Swasthya Partners', location: 'Delhi', services: ['Cashless Billing', 'Claims'] },
  { id: '3', name: 'Niramaya Health Hub', location: 'Bengaluru', services: ['Referral Management', 'Support'] },
];

export function ClinicsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Clinics
      </Text>
      <FlatList
        data={clinics}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SectionCard title={item.name} subtitle={item.location}>
            <Text variant="secondary">Services: {item.services.join(', ')}</Text>
            <Text
              variant="secondary"
              style={styles.viewLink}
              onPress={() => navigation.navigate('ClinicDetails', { clinicId: item.id })}
            >
              View details
            </Text>
          </SectionCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    padding: 24,
  },
  viewLink: {
    color: '#0B71EB',
    marginTop: 8,
  },
});
