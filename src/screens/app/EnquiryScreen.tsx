import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';
import { fetchEnquiries } from '../../services/enquiryService';

export function EnquiryScreen() {
  const navigation = useNavigation<any>();
  const { data: enquiries = [], isLoading } = useQuery({ queryKey: ['enquiries'], queryFn: fetchEnquiries });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text variant="body">Loading enquiries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Enquiries
      </Text>
      {enquiries.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="title">No enquiries yet</Text>
          <Text variant="secondary" style={styles.emptyHint}>
            Patient and clinic enquiries synced from the LOS will appear here.
          </Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
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
    color: '#0B71EB',
    marginTop: 8,
  },
});
