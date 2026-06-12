import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../theme/theme';

import { SectionCard } from '../../components/SectionCard';
import { DashboardMetric } from '../../components/DashboardMetric';
import { NavCard } from '../../components/NavCard';
import { AppTabParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../../services/dashboardService';
import { DashboardMetrics } from '../../types/auth';

type DashboardNavigationProp = any;

const tiles = [
  { title: 'Leads', subtitle: 'Track new partner opportunities', icon: '→', route: 'Leads' },
  { title: 'Enquiries', subtitle: 'Manage patient service requests', icon: '→', route: 'Enquiry' },
  { title: 'Clinics', subtitle: 'Partner clinic network', icon: '→', route: 'Clinics' },
  { title: 'Tasks', subtitle: 'Prioritize operational work', icon: '→', route: 'Tasks' },
  { title: 'Agreements', subtitle: 'Review financial contracts', icon: '→', route: 'Agreements' },
  { title: 'Profile', subtitle: 'Manage account settings', icon: '→', route: 'Profile' },
];

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { data: metrics } = useQuery<DashboardMetrics>({ queryKey: ['dashboard'], queryFn: fetchDashboard });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="header">TrustivaSetu Bridge</Text>
        <Text variant="body" style={styles.subtitle}>
          One platform for healthcare payments, clinic operations and partner growth.
        </Text>
      </View>
      <FlatList
        data={tiles}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <NavCard title={item.title} subtitle={item.subtitle} icon={item.icon} onPress={() => navigation.navigate(item.route as keyof AppTabParamList)} />
        )}
        ListHeaderComponent={() => (
          <View>
            <Text variant="title" marginBottom="sm">
              Quick metrics
            </Text>
            <View style={styles.metricsRow}>
              <DashboardMetric label="Active leads" value={metrics?.totalLeads.toString() ?? '–'} />
              <DashboardMetric label="Open tasks" value={metrics ? (metrics.totalLeads - metrics.approvedLeads).toString() : '–'} accent="#1FB0AF" />
            </View>
            <View style={styles.metricsRow}>
              <DashboardMetric label="Approved leads" value={metrics?.approvedLeads.toString() ?? '–'} accent="#F2994A" />
              <DashboardMetric label="Disbursed value" value={metrics?.disbursedValue ?? '–'} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    color: '#7A869A',
    marginTop: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
});
