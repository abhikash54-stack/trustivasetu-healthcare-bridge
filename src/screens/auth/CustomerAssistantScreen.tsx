import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/core';

import { AssistantOptionCard } from '../../components/AssistantOptionCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';

const OPTIONS = [
  { title: 'Appointment help', subtitle: 'Book, reschedule or check availability.', icon: 'event-available' as const },
  { title: 'Healthcare loan assistance', subtitle: 'Understand eligibility and documents.', icon: 'request-quote' as const },
  { title: 'Insurance help', subtitle: 'Review coverage and claim support.', icon: 'health-and-safety' as const },
  { title: 'EMI guidance', subtitle: 'Clarify repayment options and schedules.', icon: 'payments' as const },
  { title: 'Hospital chat', subtitle: 'Connect with your assigned hospital.', icon: 'chat' as const },
  { title: 'General AI assistance', subtitle: 'Ask anything about your treatment plan.', icon: 'smart-toy' as const },
];

export function CustomerAssistantScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token, customer } = route.params ?? {};
  const [selected, setSelected] = useState<string>(OPTIONS[0].title);

  const selectedOption = useMemo(() => OPTIONS.find((item) => item.title === selected) ?? OPTIONS[0], [selected]);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text variant="header" marginBottom="md">Customer assistant</Text>
      <Text variant="body" marginBottom="lg">
        Choose the help topic you need and continue with a guided support flow.
      </Text>

      {OPTIONS.map((item) => (
        <AssistantOptionCard
          key={item.title}
          title={item.title}
          subtitle={item.subtitle}
          icon={item.icon}
          onPress={() => setSelected(item.title)}
        />
      ))}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{selectedOption.title}</Text>
        <Text style={styles.cardBody}>{selectedOption.subtitle}</Text>
        <PrimaryButton label="Continue" onPress={() => Alert.alert('Coming soon', 'Backend support for this assistant topic is still being wired up.')} />
      </View>

      <PrimaryButton label="Back to dashboard" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard', params: { token, customer } }] })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BRAND.background },
  container: { padding: 20, paddingBottom: 36 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCEAE1',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#10221A', marginBottom: 6 },
  cardBody: { fontSize: 13.5, color: '#5A7A63', marginBottom: 14, lineHeight: 20 },
});
