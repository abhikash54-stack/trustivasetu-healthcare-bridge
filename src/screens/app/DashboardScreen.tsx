import { ScrollView, StyleSheet, TouchableOpacity, View, Text as RNText } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchDashboard } from '../../services/dashboardService';
import { DashboardMetrics } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { BRAND } from '../../theme/theme';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface MetricCardProps {
  label: string;
  value?: string | number | null;
  accent: string;
  icon: string;
}

function MetricCard({ label, value, accent, icon }: MetricCardProps) {
  const hasData = value !== undefined && value !== null;
  return (
    <View style={[styles.metricCard, { borderLeftColor: accent }]}>
      <View style={[styles.metricIconWrap, { backgroundColor: accent + '18' }]}>
        <MaterialIcons name={icon as any} size={20} color={accent} />
      </View>
      <RNText style={[styles.metricValue, { color: hasData ? accent : '#C8DFD0' }]}>
        {hasData ? String(value) : '—'}
      </RNText>
      <RNText style={styles.metricLabel}>{label}</RNText>
      {!hasData && <RNText style={styles.metricPending}>Awaiting API</RNText>}
    </View>
  );
}

interface ActionTileProps {
  label: string;
  icon: string;
  onPress: () => void;
}

function ActionTile({ label, icon, onPress }: ActionTileProps) {
  return (
    <TouchableOpacity style={styles.actionTile} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.actionIconWrap}>
        <MaterialIcons name={icon as any} size={26} color={BRAND.primary} />
      </View>
      <RNText style={styles.actionLabel}>{label}</RNText>
    </TouchableOpacity>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <RNText style={styles.greeting}>{getGreeting()}, {firstName}</RNText>
        <RNText style={styles.dateText}>{formatDate()}</RNText>
      </View>

      {/* Metrics Grid */}
      <RNText style={styles.sectionTitle}>At a glance</RNText>
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Total Leads"
          value={metrics?.totalLeads}
          accent={BRAND.primary}
          icon="people"
        />
        <MetricCard
          label="Approved"
          value={metrics?.approvedLeads}
          accent={BRAND.accent}
          icon="check-circle"
        />
        <MetricCard
          label="Disbursed"
          value={metrics?.disbursedValue}
          accent="#F39C12"
          icon="account-balance-wallet"
        />
        <MetricCard
          label="Active Clinics"
          value={metrics?.activeClinics}
          accent={BRAND.primaryDark}
          icon="local-hospital"
        />
      </View>

      {/* Quick Actions */}
      <RNText style={[styles.sectionTitle, { marginTop: 28 }]}>Quick actions</RNText>
      <View style={styles.actionsGrid}>
        <ActionTile label="Leads" icon="people" onPress={() => navigation.navigate('Leads')} />
        <ActionTile label="Clinic Onboarding" icon="local-hospital" onPress={() => navigation.navigate('ClinicOnboarding')} />
        <ActionTile label="Enquiries" icon="assignment" onPress={() => navigation.navigate('Enquiries')} />
        <ActionTile label="Tasks" icon="check-circle-outline" onPress={() => navigation.navigate('Tasks')} />
        <ActionTile label="Reports" icon="bar-chart" onPress={() => navigation.navigate('Reports')} />
        <ActionTile label="Profile" icon="person-outline" onPress={() => navigation.navigate('Profile')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
  },
  content: {
    padding: 20,
  },
  banner: {
    backgroundColor: BRAND.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dateText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2D1E',
    marginBottom: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#5A7A63',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  metricPending: {
    fontSize: 10,
    color: '#C8DFD0',
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionTile: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A2D1E',
    textAlign: 'center',
    lineHeight: 15,
  },
});
