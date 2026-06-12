import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';

export function HRPoliciesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.empty}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="description" size={52} color={BRAND.primary} />
        </View>
        <Text style={styles.title}>HR Policies</Text>
        <Text style={styles.subtitle}>Company policies, code of conduct,{'\n'}and HR documentation.</Text>
        <View style={styles.chip}><Text style={styles.chipText}>Coming Soon</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconWrap: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1A2D1E', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#5A7A63', textAlign: 'center', lineHeight: 22 },
  chip: {
    backgroundColor: BRAND.primaryLight, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6, marginTop: 20,
  },
  chipText: { color: BRAND.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
});
