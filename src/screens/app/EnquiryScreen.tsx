import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View, Text as RNText } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';
import { fetchEnquiries } from '../../services/enquiryService';
import { BRAND } from '../../theme/theme';

export function EnquiryScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const qr = useQuery({ queryKey: ['enquiries'], queryFn: fetchEnquiries, retry: 1 }) as any;
  const enquiries = qr.data ?? [];
  const isLoading: boolean = qr.isLoading;
  const isError: boolean = qr.isError;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={BRAND.primary} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
        <RNText style={styles.errorTitle}>Enquiries unavailable</RNText>
        <RNText style={styles.errorHint}>
          This feature is populated via the LOS portal. Contact your administrator if you expected to see data here.
        </RNText>
        <TouchableOpacity style={styles.retryBtn} onPress={() => (qr.refetch as () => void)()}>
          <RNText style={styles.retryText}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <Text variant="header" marginBottom="md">
        Enquiries
      </Text>
      {enquiries.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="inbox" size={48} color="#C8DFD0" />
          <Text variant="title" style={styles.emptyTitle}>No enquiries yet</Text>
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
    backgroundColor: BRAND.background,
    padding: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 16 },
  emptyHint: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#1A2D1E', marginTop: 16 },
  errorHint: { fontSize: 13, color: '#5A7A63', textAlign: 'center', marginTop: 8, paddingHorizontal: 32, lineHeight: 20 },
  retryBtn: {
    marginTop: 20,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  viewLink: {
    color: BRAND.primary,
    marginTop: 8,
  },
});
