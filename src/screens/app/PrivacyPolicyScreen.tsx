import { ScrollView, StyleSheet, View, Text as RNText } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../../theme/theme';
import { APP_INFO } from '../../config/environment';

export function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}> 
      <View style={styles.card}>
        <RNText style={styles.title}>Privacy Policy</RNText>
        <RNText style={styles.body}>
          TrustivaSetu collects only the minimum information needed to provide healthcare workflow support, authentication, and service delivery. We use your information to verify identity, maintain service continuity, provide customer support, and comply with applicable legal obligations.
        </RNText>
        <RNText style={styles.body}>
          Personal data may include your name, contact details, role information, and operational records related to your account. This information is stored securely and accessed only by authorised personnel or systems for legitimate business purposes.
        </RNText>
        <RNText style={styles.body}>
          You may request access, correction, or deletion of your personal information through the app support flow, subject to applicable law and retention obligations. We retain records only as long as needed for service delivery, security, or legal compliance.
        </RNText>
        <RNText style={styles.footer}>{APP_INFO.name} · {APP_INFO.copyright}</RNText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.primary, marginBottom: 12 },
  body: { fontSize: 13, lineHeight: 20, color: '#334', marginBottom: 10 },
  footer: { marginTop: 8, fontSize: 11, color: '#5A7A63' },
});
