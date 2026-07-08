import { ScrollView, StyleSheet, View, Text as RNText } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../../theme/theme';
import { APP_INFO } from '../../config/environment';

export function TermsAndConditionsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}> 
      <View style={styles.card}>
        <RNText style={styles.title}>Terms & Conditions</RNText>
        <RNText style={styles.body}>
          By using TrustivaSetu, you agree to use the platform lawfully and only for authorised business and operational purposes. You are responsible for maintaining the confidentiality of your credentials and for any activity performed through your account.
        </RNText>
        <RNText style={styles.body}>
          The platform may be updated, monitored, or restricted to improve security, reliability, and compliance. We may suspend access where required to protect data, users, or business operations.
        </RNText>
        <RNText style={styles.body}>
          All content, workflows, and documentation provided through the application remain the intellectual property of Aarthsetu Technologies Private Limited unless otherwise agreed in writing.
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
