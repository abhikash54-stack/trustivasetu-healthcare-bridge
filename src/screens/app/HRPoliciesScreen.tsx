import {
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import { fetchPolicies } from '../../services/hrPoliciesService';
import { HRPolicy, PolicyCategory } from '../../types/auth';

const CATEGORIES: { key: PolicyCategory | 'ALL'; label: string; icon: string }[] = [
  { key: 'ALL', label: 'All', icon: 'list' },
  { key: 'LEAVE', label: 'Leave', icon: 'event-note' },
  { key: 'CODE_OF_CONDUCT', label: 'Conduct', icon: 'gavel' },
  { key: 'COMPENSATION', label: 'Pay', icon: 'payments' },
  { key: 'SAFETY', label: 'Safety', icon: 'health-and-safety' },
  { key: 'GENERAL', label: 'General', icon: 'description' },
];

const CATEGORY_COLOR: Record<string, string> = {
  LEAVE: '#3498DB',
  CODE_OF_CONDUCT: '#9B59B6',
  COMPENSATION: '#27AE60',
  SAFETY: '#E74C3C',
  GENERAL: '#5A7A63',
};

function PolicyCard({ item }: { item: HRPolicy }) {
  const color = CATEGORY_COLOR[item.category] ?? '#5A7A63';
  const catLabel = CATEGORIES.find((c) => c.key === item.category)?.label ?? item.category;

  const handleOpen = async () => {
    if (item.documentUrl) {
      await Linking.openURL(item.documentUrl);
    }
  };

  return (
    <View style={styles.policyCard}>
      <View style={styles.policyHeader}>
        <View style={[styles.categoryChip, { backgroundColor: color + '18' }]}>
          <RNText style={[styles.categoryChipText, { color }]}>{catLabel}</RNText>
        </View>
        <RNText style={styles.policyDate}>
          Effective {new Date(item.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </RNText>
      </View>
      <RNText style={styles.policyTitle}>{item.title}</RNText>
      {item.description ? (
        <RNText style={styles.policyDesc} numberOfLines={3}>{item.description}</RNText>
      ) : null}
      {item.documentUrl ? (
        <TouchableOpacity onPress={handleOpen} style={styles.viewDocBtn}>
          <MaterialIcons name="open-in-new" size={14} color={BRAND.primary} />
          <RNText style={styles.viewDocText}>View Document</RNText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function HRPoliciesScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<PolicyCategory | 'ALL'>('ALL');

  const queryResult = useQuery({
    queryKey: ['hr-policies'],
    queryFn: fetchPolicies,
  }) as any;

  const allPolicies: HRPolicy[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)();

  const filtered =
    activeCategory === 'ALL'
      ? allPolicies
      : allPolicies.filter((p) => p.category === activeCategory);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {CATEGORIES.map((cat) => {
          const count = cat.key === 'ALL' ? allPolicies.length : allPolicies.filter((p) => p.category === cat.key).length;
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <MaterialIcons
                name={cat.icon as any}
                size={14}
                color={isActive ? '#FFF' : '#5A7A63'}
              />
              <RNText style={[styles.tabText, isActive && styles.tabTextActive]}>
                {cat.label}{count > 0 ? ` (${count})` : ''}
              </RNText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
          <RNText style={styles.errorText}>Could not load HR policies</RNText>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <RNText style={styles.retryText}>Retry</RNText>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="description" size={48} color="#C8DFD0" />
          <RNText style={styles.emptyTitle}>No policies found</RNText>
          <RNText style={styles.emptyHint}>
            {activeCategory === 'ALL'
              ? 'HR policies will appear here once added.'
              : 'No policies in this category.'}
          </RNText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PolicyCard item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8DFD0',
  },
  tabActive: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: '#5A7A63' },
  tabTextActive: { color: '#FFFFFF' },
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
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  categoryChipText: { fontSize: 11, fontWeight: '700' },
  policyDate: { fontSize: 11, color: '#5A7A63' },
  policyTitle: { fontSize: 14, fontWeight: '700', color: '#1A2D1E', marginBottom: 6, lineHeight: 20 },
  policyDesc: { fontSize: 13, color: '#5A7A63', lineHeight: 20, marginBottom: 10 },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  viewDocText: { color: BRAND.primary, fontSize: 13, fontWeight: '600' },
});
