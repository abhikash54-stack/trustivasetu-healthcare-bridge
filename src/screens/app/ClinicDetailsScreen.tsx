import { ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { createBox, createText } from '@shopify/restyle';
import { useQuery } from '@tanstack/react-query';

import { AppStackParamList } from '../../types/navigation';
import { fetchClinicById } from '../../services/clinicService';
import { Theme } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';

const Box = createBox<Theme>();
const Text = createText<Theme>();

type ClinicDetailsRouteProp = any;

interface ClinicDetailsScreenProps {
  route: { params: { clinicId: string } };
}

export function ClinicDetailsScreen({ route }: ClinicDetailsScreenProps) {
  const { clinicId } = route.params;
  const { data: clinic, isLoading } = useQuery(['clinic', clinicId], () => fetchClinicById(clinicId));

  if (isLoading || !clinic) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body">Loading clinic details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="header" marginBottom="sm">
        Clinic details
      </Text>
      <SectionCard title={clinic.name} subtitle={`${clinic.location} · ${clinic.status}`}>
        <Text variant="secondary">Assigned RM: {clinic.assignedRM}</Text>
        <Text variant="secondary">Business potential: {clinic.businessPotential}</Text>
      </SectionCard>

      <SectionCard title="Contact">
        <DetailRow label="Address" value={clinic.address} />
        <DetailRow label="Contact person" value={clinic.contactPerson} />
        <DetailRow label="Phone" value={clinic.contactNumber} />
        <DetailRow label="Email" value={clinic.email} />
      </SectionCard>

      <SectionCard title="Current targets">
        <DetailRow label="Month" value={`${clinic.currentTargets.month} ${clinic.currentTargets.year}`} />
        <DetailRow label="Leads target" value={`${clinic.currentTargets.leadsTarget}`} />
        <DetailRow label="Disbursal target" value={clinic.currentTargets.disbursalTarget} />
        <DetailRow label="Achieved leads" value={`${clinic.currentTargets.achievedLeads}`} />
        <DetailRow label="Achieved disbursal" value={clinic.currentTargets.achievedDisbursal} />
      </SectionCard>

      <SectionCard title="Recent leads">
        {clinic.recentLeads.map((recentLead: import('../../types/auth').Lead) => (
            <Box key={recentLead.id} marginBottom="sm">
              <Text variant="body">{recentLead.applicantName}</Text>
              <Text variant="secondary">{recentLead.status} · {recentLead.updatedAt}</Text>
            </Box>
          ))}
      </SectionCard>

      <SectionCard title="Notes">
        <Text variant="body">{clinic.notes}</Text>
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
