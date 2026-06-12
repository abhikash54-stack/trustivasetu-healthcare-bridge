import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../theme/theme';
import { Lead } from '../../types/auth';
import { SectionCard } from '../../components/SectionCard';
import { AppStackParamList } from '../../types/navigation';

const leads: Lead[] = [
  { id: '1', applicantName: 'Nisha Rao', clinicName: 'Vertex Care Clinic', source: 'Referral', status: 'NEW', assignedTo: 'Asha Patel', updatedAt: '1h ago', amount: '₹420,000' },
  { id: '2', applicantName: 'Rajiv Kumar', clinicName: 'Swasthya Partners', source: 'Clinic', status: 'APPROVED', assignedTo: 'Neha Sharma', updatedAt: '3h ago', amount: '₹1,250,000' },
  { id: '3', applicantName: 'Mira Singh', clinicName: 'Niramaya Health Hub', source: 'Website', status: 'DISBURSED', assignedTo: 'Vikram Patel', updatedAt: '5h ago', amount: '₹760,000' },
];

export function LeadsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Leads
      </Text>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SectionCard title={item.applicantName} subtitle={`${item.clinicName} · ${item.status}`}>
            <Text variant="secondary">Assigned to {item.assignedTo}</Text>
            <Text variant="secondary">Updated {item.updatedAt}</Text>
            <Text
              variant="secondary"
              style={styles.viewLink}
              onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}
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
