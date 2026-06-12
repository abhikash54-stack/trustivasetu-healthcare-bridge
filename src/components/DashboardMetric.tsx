import { createBox, createText } from '@shopify/restyle';

const Box = createBox();
const Text = createText();

interface DashboardMetricProps {
  label: string;
  value: string;
  accent?: string;
}

export function DashboardMetric({ label, value, accent }: DashboardMetricProps) {
  return (
    <Box
      backgroundColor="background"
      borderRadius="m"
      padding="md"
      marginRight="sm"
      width={140}
      style={{ elevation: 1 }}
    >
      <Text variant="secondary" marginBottom="xs">
        {label}
      </Text>
      <Text variant="title" style={{ color: accent ?? '#0B71EB' }}>
        {value}
      </Text>
    </Box>
  );
}
