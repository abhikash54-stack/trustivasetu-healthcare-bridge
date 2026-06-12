import { TouchableOpacity } from 'react-native';
import { Text, Box } from '../theme/theme';

interface NavCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

export function NavCard({ title, subtitle, icon, onPress }: NavCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginBottom: 16 }}>
      <Box
        backgroundColor="surface"
        borderRadius="m"
        padding="md"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Box>
          <Text variant="title" marginBottom="xs">
            {title}
          </Text>
          <Text variant="secondary">{subtitle}</Text>
        </Box>
        <Box
          width={48}
          height={48}
          backgroundColor="background"
          borderRadius="m"
          alignItems="center"
          justifyContent="center"
        >
          <Text variant="title">{icon}</Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}
