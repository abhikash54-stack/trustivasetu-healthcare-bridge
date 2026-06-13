import {
  FlatList,
  Linking,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text as RNText,
  ActivityIndicator,
} from 'react-native';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import { fetchEmployees } from '../../services/employeeService';
import { Employee } from '../../types/auth';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  RM: 'Regional Manager',
  EMPLOYEE: 'Employee',
};

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  '#006B3C', '#3498DB', '#9B59B6', '#E67E22', '#E74C3C',
  '#1ABC9C', '#2ECC71', '#F39C12', '#8E44AD', '#2980B9',
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function EmployeeCard({ item }: { item: Employee }) {
  const color = avatarColor(item.id);
  const roleLabel = ROLE_LABELS[item.role?.toUpperCase()] ?? item.role;

  const handleCall = () => {
    if (item.phone) Linking.openURL(`tel:${item.phone}`);
  };

  const handleEmail = () => {
    if (item.email) Linking.openURL(`mailto:${item.email}`);
  };

  return (
    <View style={styles.employeeCard}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <RNText style={styles.avatarText}>{initials(item.name)}</RNText>
      </View>
      <View style={styles.employeeInfo}>
        <RNText style={styles.employeeName}>{item.name}</RNText>
        <RNText style={styles.employeeDesig}>{item.designation || roleLabel}</RNText>
        {item.department ? (
          <RNText style={styles.employeeDept}>{item.department}</RNText>
        ) : null}
      </View>
      <View style={styles.contactBtns}>
        {item.phone ? (
          <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
            <MaterialIcons name="call" size={16} color={BRAND.primary} />
          </TouchableOpacity>
        ) : null}
        {item.email ? (
          <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
            <MaterialIcons name="email" size={16} color={BRAND.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export function EmployeeDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const queryResult = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  }) as any;

  const allEmployees: Employee[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)();

  const filtered = useMemo(() => {
    if (!search.trim()) return allEmployees;
    const q = search.toLowerCase();
    return allEmployees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q) ||
        ROLE_LABELS[e.role?.toUpperCase()]?.toLowerCase().includes(q),
    );
  }, [allEmployees, search]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#5A7A63" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, role, or department"
            placeholderTextColor="#B0C8B8"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={18} color="#5A7A63" />
            </TouchableOpacity>
          )}
        </View>
        {allEmployees.length > 0 && (
          <RNText style={styles.countText}>{filtered.length} of {allEmployees.length} employees</RNText>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
          <RNText style={styles.errorText}>Could not load directory</RNText>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <RNText style={styles.retryText}>Retry</RNText>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="person-search" size={48} color="#C8DFD0" />
          <RNText style={styles.emptyTitle}>
            {search ? 'No matches found' : 'No employees found'}
          </RNText>
          <RNText style={styles.emptyHint}>
            {search ? 'Try a different search term.' : 'Employees will appear here once added.'}
          </RNText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EmployeeCard item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  searchContainer: { padding: 20, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A2D1E' },
  countText: { fontSize: 11, color: '#5A7A63', marginTop: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorText: { color: '#E74C3C', fontSize: 15, fontWeight: '600', marginTop: 12 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1A2D1E', marginTop: 16 },
  emptyHint: { fontSize: 13, color: '#5A7A63', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  employeeInfo: { flex: 1 },
  employeeName: { fontSize: 14, fontWeight: '700', color: '#1A2D1E' },
  employeeDesig: { fontSize: 12, color: BRAND.primary, fontWeight: '600', marginTop: 1 },
  employeeDept: { fontSize: 11, color: '#5A7A63', marginTop: 1 },
  contactBtns: { flexDirection: 'row', gap: 8 },
  contactBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
