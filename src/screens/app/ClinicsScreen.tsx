import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';
import { fetchClinics } from '../../services/clinicService';
import { BRAND } from '../../theme/theme';

export function ClinicsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { data: clinics = [], isLoading } = useQuery({ queryKey: ['clinics'], queryFn: fetchClinics });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text variant="body">Loading clinics...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <Text variant="header" marginBottom="md">
        Clinics
      </Text>
      {clinics.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="title">No clinics onboarded yet</Text>
          <Text variant="secondary" style={styles.emptyHint}>
            Partner clinics will appear here once onboarded and activated.
          </Text>
        </View>
      ) : (
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
