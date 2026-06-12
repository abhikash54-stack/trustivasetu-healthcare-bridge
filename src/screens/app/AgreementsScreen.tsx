import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from '@shopify/restyle';
import { Agreement } from '../../types/auth';
import { SectionCard } from '../../components/SectionCard';

const agreements: Agreement[] = [
  { id: '1', title: 'Hospital partner contract', counterparty: 'Aster', status: 'Active' },
  { id: '2', title: 'Payment manager SLA', counterparty: 'MediPay', status: 'Pending' },
  { id: '3', title: 'Clinic onboarding agreement', counterparty: 'HealthWave', status: 'Signed' },
];

export function AgreementsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Agreements
      </Text>
      <FlatList
        data={agreements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SectionCard title={item.title} subtitle={`${item.counterparty} · ${item.status}`}>
            <Text variant="secondary">Status: {item.status}</Text>
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
});
