import { ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { fetchLeadById } from '../../services/leadService';
import { Text, Box } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';

type LeadDetailsRouteProp = any;

interface LeadDetailsScreenProps {
  route: { params: { leadId: string } };
}

export function LeadDetailsScreen({ route }: LeadDetailsScreenProps) {
  const { leadId } = route.params;
  const { data: lead, isLoading } = useQuery(['lead', leadId], () => fetchLeadById(leadId));

  if (isLoading || !lead) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body">Loading lead details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="header" marginBottom="sm">
        Lead details
      </Text>
      <SectionCard title={lead.applicantName} subtitle={`${lead.clinicName} · ${lead.status}`}>
        <Text variant="secondary">Assigned to {lead.assignedTo}</Text>
        <Text variant="secondary">Updated {lead.updatedAt}</Text>
      </SectionCard>

      <SectionCard title="Financial summary">
        <DetailRow label="Applied amount" value={lead.amount} />
        <DetailRow label="Approved amount" value={lead.approvedAmount} />
        <DetailRow label="Disbursed amount" value={lead.disbursedAmount} />
        <DetailRow label="Lender" value={lead.lenderName} />
      </SectionCard>

      <SectionCard title="Timeline">
        <DetailRow label="Application" value={lead.applicationDate} />
        <DetailRow label="Approval" value={lead.approvalDate} />
        <DetailRow label="Disbursal" value={lead.disbursalDate} />
      </SectionCard>

      <SectionCard title="Contact">
        <DetailRow label="Phone" value={lead.phone} />
        <DetailRow label="Email" value={lead.email} />
        <DetailRow label="Stage" value={lead.stage} />
      </SectionCard>

      <SectionCard title="Status history">
        {lead.statusHistory.map((historyItem: { status: string; updatedAt: string; note?: string }) => (
            <Box key={`${historyItem.status}-${historyItem.updatedAt}`} marginBottom="sm">
              <Text variant="body">{historyItem.status}</Text>
              <Text variant="secondary">{historyItem.updatedAt}</Text>
              {historyItem.note ? <Text variant="secondary">{historyItem.note}</Text> : null}
            </Box>
          ))}
      </SectionCard>

      <SectionCard title="Remarks">
        <Text variant="body">{lead.remarks}</Text>
      </SectionCard>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="secondary">{label}</Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
