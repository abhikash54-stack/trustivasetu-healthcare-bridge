import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/core';

import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { HospitalAccessFlow } from '../../components/HospitalAccessFlow';
import { fetchHospitals, HospitalRecord } from '../../services/hospitalService';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';

export function CustomerHospitalScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token, customer } = route.params ?? {};

  const [state, setState] = useState(String(customer?.state ?? ''));
  const [city, setCity] = useState(String(customer?.city ?? ''));
  const [area, setArea] = useState(String(customer?.area ?? ''));
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const canLoad = useMemo(() => Boolean(state.trim() && city.trim() && area.trim()), [area, city, state]);

  useEffect(() => {
    if (!canLoad) {
      setHospitals([]);
      setSelectedHospital(null);
      return;
    }

    let active = true;
    async function load() {
      setLoading(true);
      try {
        const result = await fetchHospitals({ state, city, area, page: 1, limit: 6 }, token);
        if (!active) return;
        setHospitals(result.items);
        setPage(1);
        setHasMore(result.hasMore);
        setSelectedHospital(null);
      } catch (error: any) {
        if (active) Alert.alert('Could not load hospitals', error?.message ?? 'Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [area, city, state, token, canLoad]);

  const loadMore = async () => {
    if (!canLoad || !hasMore || loading) return;
    setLoading(true);
    try {
      const result = await fetchHospitals({ state, city, area, page: page + 1, limit: 6 }, token);
      setHospitals((prev) => [...prev, ...result.items]);
      setPage((prev) => prev + 1);
      setHasMore(result.hasMore);
    } catch (error: any) {
      Alert.alert('Could not load more', error?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text variant="header" marginBottom="md">Find hospitals near you</Text>
      <Text variant="body" marginBottom="lg">
        Hospitals will appear only after you choose the location details you provided earlier.
      </Text>

      <View style={styles.card}>
        <FormInput label="State" placeholder="e.g. Karnataka" value={state} onChangeText={setState} />
        <FormInput label="City" placeholder="e.g. Bengaluru" value={city} onChangeText={setCity} />
        <FormInput label="Area / Locality" placeholder="e.g. Koramangala" value={area} onChangeText={setArea} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}><ActivityIndicator color={BRAND.primary} /></View>
      ) : canLoad && hospitals.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No hospitals found</Text>
          <Text style={styles.emptyBody}>No hospitals are available in the selected area yet.</Text>
        </View>
      ) : (
        <View style={{ marginTop: 16 }}>
          {hospitals.map((hospital) => (
            <Pressable
              key={hospital.id}
              style={[styles.hospitalItem, selectedHospital?.id === hospital.id && styles.hospitalItemActive]}
              onPress={() => setSelectedHospital(hospital)}
            >
              <View style={styles.hospitalIconWrap}><Text style={styles.hospitalIcon}>🏥</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                {hospital.address ? <Text style={styles.hospitalMeta}>{hospital.address}</Text> : null}
              </View>
            </Pressable>
          ))}
          {hasMore ? (
            <PrimaryButton label="Load more" onPress={loadMore} disabled={loading} />
          ) : null}
        </View>
      )}

      <HospitalAccessFlow token={token} hospital={selectedHospital} onAssigned={() => navigation.goBack()} />
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
  },
  inputRow: {
    borderWidth: 1,
    borderColor: '#E6ECF4',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: '#F8FAFF',
  },
  inputValue: { color: '#23313E', fontSize: 14 },
  loadingBox: { alignItems: 'center', paddingVertical: 20 },
  emptyBox: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DCEAE1',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#10221A' },
  emptyBody: { color: '#5A7A63', textAlign: 'center', marginTop: 6 },
  hospitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
  hospitalItemActive: { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight },
  hospitalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hospitalIcon: { fontSize: 20 },
  hospitalName: { fontSize: 14, fontWeight: '700', color: '#10221A' },
  hospitalMeta: { fontSize: 12.5, color: '#5A7A63', marginTop: 3 },
});
