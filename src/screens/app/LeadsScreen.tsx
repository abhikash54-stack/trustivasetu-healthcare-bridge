import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';
import { fetchLeads } from '../../services/leadService';
import { BRAND } from '../../theme/theme';

export function LeadsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { data: leads = [], isLoading } = useQuery({ queryKey: ['leads'], queryFn: fetchLeads });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text variant="body">Loading leads...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <Text variant="header" marginBottom="md">
        Leads
      </Text>
      {leads.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="title">No leads yet</Text>
          <Text variant="secondary" style={styles.emptyHint}>
            Leads submitted through partner clinics will appear here.
          </Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
    padding: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  viewLink: {
    color: BRAND.primary,
    marginTop: 8,
  },
});
