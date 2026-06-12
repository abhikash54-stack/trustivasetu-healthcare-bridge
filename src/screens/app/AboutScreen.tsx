import { ScrollView, StyleSheet, View, Text as RNText, Linking, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import { APP_INFO, CURRENT_ENV } from '../../config/environment';

function InfoRow({ icon, label, value, onPress }: { icon: string; label: string; value: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoIcon}>
        <MaterialIcons name={icon as any} size={18} color={BRAND.primary} />
      </View>
      <View style={styles.infoText}>
        <RNText style={styles.infoLabel}>{label}</RNText>
        <RNText style={[styles.infoValue, onPress && { color: BRAND.primary }]}>{value}</RNText>
      </View>
      {onPress && <MaterialIcons name="open-in-new" size={16} color={BRAND.primary} />}
    </TouchableOpacity>
  );
}

export function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand Card */}
      <View style={styles.brandCard}>
        <View style={styles.logoWrap}>
          <RNText style={styles.logoLetter}>T</RNText>
        </View>
        <RNText style={styles.appName}>{APP_INFO.name}</RNText>
        <RNText style={styles.tagline}>{APP_INFO.tagline}</RNText>
        <View style={styles.versionRow}>
          <View style={styles.versionBadge}>
            <RNText style={styles.versionText}>v{APP_INFO.version}</RNText>
          </View>
          <View style={styles.versionBadge}>
            <RNText style={styles.versionText}>Build {APP_INFO.buildNumber}</RNText>
          </View>
          {CURRENT_ENV !== 'production' && (
            <View style={[styles.versionBadge, { backgroundColor: '#F39C12' }]}>
              <RNText style={styles.versionText}>{CURRENT_ENV.toUpperCase()}</RNText>
            </View>
          )}
        </View>
      </View>

      {/* App Info */}
      <View style={styles.card}>
        <RNText style={styles.sectionTitle}>App information</RNText>
        <InfoRow icon="info-outline" label="Version" value={`${APP_INFO.version} (Build ${APP_INFO.buildNumber})`} />
        <InfoRow icon="business" label="Company" value="Aarthsetu Technologies Private Limited" />
        <InfoRow icon="category" label="Division" value="TrustivaSetu" />
        <InfoRow
          icon="language"
          label="Website"
          value={APP_INFO.website}
          onPress={() => Linking.openURL(APP_INFO.website)}
        />
        <InfoRow
          icon="email"
          label="Support Email"
          value={APP_INFO.supportEmail}
          onPress={() => Linking.openURL(`mailto:${APP_INFO.supportEmail}`)}
        />
      </View>

      {/* Legal */}
      <View style={styles.card}>
        <RNText style={styles.sectionTitle}>Legal</RNText>
        <InfoRow icon="privacy-tip" label="Privacy Policy" value="View Privacy Policy" onPress={() => {}} />
        <InfoRow icon="gavel" label="Terms & Conditions" value="View Terms & Conditions" onPress={() => {}} />
        <InfoRow icon="security" label="Data Protection" value="DPDPA 2023 Compliant" />
      </View>

      {/* Copyright */}
      <RNText style={styles.copyright}>{APP_INFO.copyright}</RNText>
      <RNText style={styles.madeIn}>Made with ♥ in India</RNText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
  },
  content: {
    padding: 20,
  },
  brandCard: {
    backgroundColor: BRAND.primary,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  versionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  versionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF6F1',
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#5A7A63',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    color: '#1A2D1E',
    fontWeight: '500',
    marginTop: 1,
  },
  copyright: {
    fontSize: 11,
    color: '#5A7A63',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  madeIn: {
    fontSize: 12,
    color: BRAND.primary,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
});
