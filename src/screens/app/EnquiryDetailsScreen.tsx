import { ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { fetchEnquiryById } from '../../services/enquiryService';
import { Text, Box } from '../../theme/theme';
import { SectionCard } from '../../components/SectionCard';

type EnquiryDetailsRouteProp = any;

interface EnquiryDetailsScreenProps {
  route: { params: { enquiryId: string } };
}

export function EnquiryDetailsScreen({ route }: EnquiryDetailsScreenProps) {
  const { enquiryId } = route.params;
  const { data: enquiry, isLoading } = useQuery(['enquiry', enquiryId], () => fetchEnquiryById(enquiryId));

  if (isLoading || !enquiry) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body">Loading enquiry details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="header" marginBottom="sm">
        Enquiry details
      </Text>
      <SectionCard title={enquiry.title} subtitle={`${enquiry.status} · ${enquiry.requestedAt}`}>
        <Text variant="secondary">Clinic: {enquiry.clinicName}</Text>
        <Text variant="secondary">Type: {enquiry.enquiryType}</Text>
      </SectionCard>

      <SectionCard title="Patient details">
        <DetailRow label="Patient" value={enquiry.patientName} />
        <DetailRow label="Hospital" value={enquiry.hospitalName} />
        <DetailRow label="Mobile" value={enquiry.mobileNumber} />
      </SectionCard>

      <SectionCard title="Treatment">
        <DetailRow label="Treatment" value={enquiry.treatmentName} />
        <DetailRow label="Financing" value={enquiry.financingRequired} />
      </SectionCard>

      <SectionCard title="Reference">
        <DetailRow label="Reference ID" value={enquiry.referenceId} />
      </SectionCard>

      <SectionCard title="Remarks">
        <Text variant="body">{enquiry.remarks}</Text>
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
