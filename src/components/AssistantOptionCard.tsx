import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Text } from '../theme/theme';
import { BRAND } from '../theme/theme';

interface AssistantOptionCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

export function AssistantOptionCard({ title, subtitle, icon, onPress }: AssistantOptionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={20} color={BRAND.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#10221A' },
  subtitle: { fontSize: 12.5, color: '#5A7A63', marginTop: 2 },
});
