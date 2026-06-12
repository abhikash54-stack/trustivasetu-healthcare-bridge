import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../theme/theme';
import { Enquiry } from '../../types/auth';
import { SectionCard } from '../../components/SectionCard';
import { AppStackParamList } from '../../types/navigation';

const enquiries: Enquiry[] = [
  { id: '1', title: 'Invoice reconciliation', status: 'Pending', patientName: 'Deepa', requestedAt: 'Today' },
  { id: '2', title: 'Payment approval', status: 'In progress', patientName: 'Arjun', requestedAt: 'Yesterday' },
  { id: '3', title: 'Clinic onboarding', status: 'Completed', patientName: 'Sunita', requestedAt: '2 days ago' },
];

export function EnquiryScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Enquiries
      </Text>
      <FlatList
        data={enquiries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SectionCard title={item.title} subtitle={`${item.status} · ${item.requestedAt}`}>
            <Text variant="secondary">Patient: {item.patientName}</Text>
            <Text
              variant="secondary"
              style={styles.viewLink}
              onPress={() => navigation.navigate('EnquiryDetails', { enquiryId: item.id })}
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
