import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/core';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { fetchCustomerMe, customerLogout, CustomerLead, CustomerProfile } from '../../services/customerAuthService';

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Application received',
  OTP_VERIFIED: 'Application received',
  PAN_VERIFIED: 'Under review',
  DOCS_PENDING: 'Documents pending',
  API_RUNNING: 'Checking with lenders',
  ELIGIBLE: 'Offers available',
  AGREEMENT: 'Agreement pending',
  MANDATE: 'Mandate pending',
  APPROVED: 'Approved',
  DISBURSED: 'Disbursed',
  COMPLETED: 'Completed',
  REJECTED: 'Not approved',
  CANCELLED: 'Cancelled',
};

function money(v: number | null) {
  if (v === null || v === undefined) return '—';
  return `₹${v.toLocaleString('en-IN')}`;
}

export function CustomerDashboardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token, customer: initialCustomer } = route.params ?? {};

  const [customer, setCustomer] = useState<CustomerProfile | null>(initialCustomer ?? null);
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCustomerMe(token)
      .then((data) => {
        if (!active) return;
        setCustomer(data.customer);
        setLeads(data.leads);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token]);

  async function handleLogout() {
    await customerLogout(token);
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hi, {customer?.name ?? 'there'}</Text>
          <Text style={styles.subGreeting}>{customer?.email ?? customer?.phone ?? ''}</Text>
        </View>
        <Pressable onPress={handleLogout} accessibilityRole="button">
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.quickActionsRow}>
        <Pressable style={styles.quickAction} onPress={() => navigation.navigate('CustomerAssistant', { token, customer })}>
          <Text style={styles.quickActionTitle}>Assistant</Text>
          <Text style={styles.quickActionSubtitle}>Support for loans, EMI and hospital help</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => navigation.navigate('CustomerHospital', { token, customer })}>
          <Text style={styles.quickActionTitle}>Hospitals</Text>
          <Text style={styles.quickActionSubtitle}>Secure, area-based hospital access</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={BRAND.primary} style={{ marginTop: 40 }} />
      ) : leads.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No applications yet</Text>
          <Text style={styles.emptyBody}>
            Once you apply for treatment financing at a partner clinic with this email or
            mobile number, it will show up here.
          </Text>
        </View>
      ) : (
        leads.map((lead) => (
          <View key={lead.id} style={styles.leadCard}>
            <View style={styles.leadHeaderRow}>
              <Text style={styles.leadClinic}>{lead.clinic?.name ?? 'Trustiva Setu'}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{STATUS_LABEL[lead.status] ?? lead.status}</Text>
              </View>
            </View>

            <View style={styles.leadRow}>
              <Text style={styles.leadLabel}>Approved amount</Text>
              <Text style={styles.leadValue}>{money(lead.approvedAmount)}</Text>
            </View>
            <View style={styles.leadRow}>
              <Text style={styles.leadLabel}>EMI</Text>
              <Text style={styles.leadValue}>
                {money(lead.emiAmount)} {lead.emiCount ? `× ${lead.emiCount}` : ''}
              </Text>
            </View>

            {lead.kfsToken && (
              <Pressable
                style={styles.kfsButton}
                onPress={() => Linking.openURL(`https://lms.trustivasetu.com/kfs/${lead.kfsToken}`)}
              >
                <Text style={styles.kfsButtonText}>View Key Fact Statement</Text>
              </Pressable>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BRAND.background },
  container: { padding: 20, paddingBottom: 60 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1A2D1E' },
  subGreeting: { fontSize: 12.5, color: '#5A7A63', marginTop: 2 },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#E74C3C' },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
  quickActionTitle: { fontSize: 14, fontWeight: '700', color: '#10221A' },
  quickActionSubtitle: { fontSize: 12.5, color: '#5A7A63', marginTop: 4, lineHeight: 17 },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1A2D1E', marginBottom: 6 },
  emptyBody: { fontSize: 13, color: '#5A7A63', textAlign: 'center', lineHeight: 19 },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
  leadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leadClinic: { fontSize: 15, fontWeight: '700', color: '#1A2D1E' },
  statusPill: {
    backgroundColor: BRAND.primaryLight,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusPillText: { fontSize: 11, fontWeight: '700', color: BRAND.primaryDark },
  leadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  leadLabel: { fontSize: 12.5, color: '#5A7A63' },
  leadValue: { fontSize: 13, fontWeight: '600', color: '#1A2D1E' },
  kfsButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND.primary,
    alignItems: 'center',
  },
  kfsButtonText: { fontSize: 13, fontWeight: '700', color: BRAND.primary },
});
