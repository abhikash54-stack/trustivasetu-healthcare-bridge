import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View, Text as RNText } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import { APP_INFO } from '../../config/environment';

function ContactCard({ icon, title, value, onPress }: { icon: string; title: string; value: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon as any} size={18} color={BRAND.primary} />
      </View>
      <View style={styles.cardBody}>
        <RNText style={styles.cardTitle}>{title}</RNText>
        <RNText style={styles.cardValue}>{value}</RNText>
      </View>
    </TouchableOpacity>
  );
}

export function SupportScreen() {
  const insets = useSafeAreaInsets();

  const handleEmail = () => Linking.openURL(`mailto:${APP_INFO.supportEmail}?subject=${encodeURIComponent('TrustivaSetu Support Request')}`);
  const handleGrievance = () => Linking.openURL(`mailto:${APP_INFO.grievanceEmail}?subject=${encodeURIComponent('TrustivaSetu Grievance')}`);
  const handleCall = () => Linking.openURL(`tel:${APP_INFO.supportPhone}`);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}> 
      <View style={styles.hero}>
        <RNText style={styles.title}>Support & Grievance</RNText>
        <RNText style={styles.subtitle}>Need help with access, onboarding, privacy, or account issues? We are here to help.</RNText>
      </View>

      <ContactCard icon="email" title="Support Email" value={APP_INFO.supportEmail} onPress={handleEmail} />
      <ContactCard icon="phone" title="Support Phone" value={APP_INFO.supportPhone} onPress={handleCall} />
      <ContactCard icon="report-problem" title="Grievance Email" value={APP_INFO.grievanceEmail} onPress={handleGrievance} />

      <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Request logged', 'A support request will be routed to the TrustivaSetu support team.')}> 
        <RNText style={styles.buttonText}>Request help</RNText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20 },
  hero: { backgroundColor: BRAND.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
  iconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: BRAND.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 12, color: '#5A7A63', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { marginTop: 2, fontSize: 14, color: '#1A2D1E', fontWeight: '600' },
  button: { marginTop: 10, backgroundColor: BRAND.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
