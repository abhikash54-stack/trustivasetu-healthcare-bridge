import { createBox, createText } from '@shopify/restyle';

const Box = createBox();
const Text = createText();

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <Box
      backgroundColor="surface"
      borderRadius="m"
      padding="md"
      marginBottom="md"
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}
    >
      <Text variant="title" marginBottom="xs">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="secondary" marginBottom="sm">
          {subtitle}
        </Text>
      ) : null}
      {children}
    </Box>
  );
}
