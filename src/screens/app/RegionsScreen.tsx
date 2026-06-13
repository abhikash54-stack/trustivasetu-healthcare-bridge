import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { invalidateQueries } from '../../api/queryClient';
import { BRAND } from '../../theme/theme';
import { Region } from '../../types/auth';
import { fetchRegions, createRegion } from '../../services/regionsService';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

export function RegionsScreen() {
  const { user } = useAuth();
  const canCreate = ADMIN_ROLES.includes(user?.role?.toUpperCase() ?? '');

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const queryResult = useQuery<Region[]>({ queryKey: ['regions'], queryFn: fetchRegions }) as any;
  const regions: Region[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)().finally(() => setRefreshing(false));

  const createMutation = useMutation({
    mutationFn: () => createRegion({ name: name.trim(), code: code.trim().toUpperCase() }),
    onSuccess: () => {
      invalidateQueries(['regions']);
      setShowModal(false);
      setName('');
      setCode('');
      Alert.alert('Region created', 'The region has been added successfully.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message ?? 'Could not create region.');
    },
  });

  const handleCreate = () => {
    if (!name.trim()) return Alert.alert('Required', 'Enter the region name.');
    if (!code.trim()) return Alert.alert('Required', 'Enter the region code (e.g. MH, DL).');
    createMutation.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND.primary} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
        <Text style={styles.errorText}>Could not load regions</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Regions</Text>
        <Text style={styles.headerSub}>{regions.length} region{regions.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={regions}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); refetch(); }}
            tintColor={BRAND.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MaterialIcons name="map" size={40} color="#C8DFD0" />
            <Text style={styles.emptyText}>No regions found</Text>
          </View>
        }
        renderItem={({ item: r }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <MaterialIcons name="map" size={20} color={BRAND.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.name}</Text>
                <Text style={styles.code}>{r.code}</Text>
                <Text style={styles.date}>Added {formatDate(r.createdAt)}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: r.isActive ? '#27AE6020' : '#E67E2220' }]}>
              <Text style={[styles.statusText, { color: r.isActive ? '#27AE60' : '#E67E22' }]}>
                {r.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        )}
      />

      {canCreate && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Region</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FormInput
              label="Region Name *"
              placeholder="e.g. Maharashtra"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <FormInput
              label="Region Code *"
              placeholder="e.g. MH"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                label={createMutation.isPending ? 'Creating...' : 'Create Region'}
                onPress={handleCreate}
                disabled={createMutation.isPending}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorText: { color: '#E74C3C', fontSize: 15, fontWeight: '600', marginTop: 12 },
  retryBtn: { marginTop: 16, backgroundColor: BRAND.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E8F0EC' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  headerSub: { fontSize: 13, color: '#666', marginTop: 2 },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: BRAND.primaryLight, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#1A2D1E' },
  code: { fontSize: 12, fontWeight: '600', color: BRAND.primary, marginTop: 2 },
  date: { fontSize: 11, color: '#999', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: '#999', fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalContent: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
});
