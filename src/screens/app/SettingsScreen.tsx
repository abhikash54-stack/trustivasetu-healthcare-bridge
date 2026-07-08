import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND } from '../../theme/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { APP_INFO } from '../../config/environment';
import { checkForAvailableUpdates } from '../../hooks/useOTAUpdates';
import { getCurrentAppVersionInfo, getLastUpdateCheck } from '../../services/updateService';

function SettingRow({
  icon,
  label,
  subtitle,
  value,
  onPress,
  destructive,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const labelColor = destructive ? '#E74C3C' : '#1A2D1E';
  const iconColor = destructive ? '#E74C3C' : BRAND.primary;
  const iconBg = destructive ? '#FDECEA' : BRAND.primaryLight;

  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <RNText style={[styles.rowLabel, { color: labelColor }]}>{label}</RNText>
        {subtitle ? <RNText style={styles.rowSub}>{subtitle}</RNText> : null}
      </View>
      {value ? (
        <RNText style={styles.rowValue}>{value}</RNText>
      ) : onPress ? (
        <MaterialIcons name="chevron-right" size={20} color={destructive ? '#E74C3C' : '#CCC'} />
      ) : null}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <RNText style={styles.sectionTitle}>{title}</RNText>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<string | null>(null);
  const versionInfo = getCurrentAppVersionInfo();

  useEffect(() => {
    getLastUpdateCheck().then(setLastUpdateCheck).catch(() => undefined);
  }, []);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear locally cached data. Your account data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((k: string) => !k.startsWith('@trustiva:'));
            if (cacheKeys.length > 0) {
              await AsyncStorage.multiRemove(cacheKeys);
            }
            Alert.alert('Done', 'App cache has been cleared.');
          },
        },
      ],
    );
  };

  const handleCheckForUpdates = async () => {
    await checkForAvailableUpdates(true);
    const nextCheck = await getLastUpdateCheck();
    setLastUpdateCheck(nextCheck);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <Section title="Account">
        <SettingRow
          icon="person"
          label="Signed in as"
          subtitle={user?.email ?? '—'}
          value={user?.role?.replace('_', ' ')}
        />
      </Section>

      <Section title="Application">
        <SettingRow
          icon="info-outline"
          label="App Name"
          value={APP_INFO.name}
        />
        <SettingRow
          icon="code"
          label="Version"
          value={`v${versionInfo.version}`}
        />
        <SettingRow
          icon="build"
          label="Build Number"
          value={versionInfo.buildNumber}
        />
        <SettingRow
          icon="event"
          label="Release Date"
          value={versionInfo.releaseDate}
        />
        <SettingRow
          icon="system-update-alt"
          label="OTA Status"
          value="Enabled"
        />
        <SettingRow
          icon="schedule"
          label="Last Update Check"
          value={lastUpdateCheck ? new Date(lastUpdateCheck).toLocaleString() : 'Not run yet'}
        />
        <SettingRow
          icon="refresh"
          label="Check for Updates"
          subtitle="Verify the current app and download portal"
          onPress={handleCheckForUpdates}
        />
        <SettingRow
          icon="business"
          label="Organisation"
          value="Aarthsetu Technologies Pvt Ltd"
        />
      </Section>

      <Section title="Data & Storage">
        <SettingRow
          icon="cached"
          label="Clear App Cache"
          subtitle="Remove locally cached query data"
          onPress={handleClearCache}
        />
      </Section>

      <Section title="Security">
        <SettingRow
          icon="shield"
          label="Session Management"
          subtitle="Cookie-based session managed by OS HTTP stack"
          value="Active"
        />
        <SettingRow
          icon="lock"
          label="Local Storage"
          subtitle="Only user profile cached locally — no tokens stored"
          value="Secure"
        />
        <SettingRow
          icon="delete-outline"
          label="Delete Account"
          subtitle="Request account deletion"
          onPress={() => navigation.navigate('DeleteAccount')}
        />
      </Section>

      <Section title="Support">
        <SettingRow
          icon="privacy-tip"
          label="Privacy Policy"
          subtitle="Review our privacy commitments"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        <SettingRow
          icon="gavel"
          label="Terms & Conditions"
          subtitle="Read applicable service terms"
          onPress={() => navigation.navigate('TermsAndConditions')}
        />
        <SettingRow
          icon="support-agent"
          label="Support & Grievance"
          subtitle="Contact support or raise a grievance"
          onPress={() => navigation.navigate('Support')}
        />
      </Section>

      <View style={styles.footer}>
        <RNText style={styles.footerText}>{APP_INFO.name}</RNText>
        <RNText style={styles.footerSub}>A Division of Aarthsetu Technologies Private Limited</RNText>
        <RNText style={styles.footerVersion}>Build {versionInfo.buildNumber} · Admin Settings</RNText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowSub: { fontSize: 11, color: '#5A7A63', marginTop: 1 },
  rowValue: { fontSize: 12, color: '#5A7A63', fontWeight: '600' },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    gap: 2,
  },
  footerText: { color: 'rgba(90,122,99,0.8)', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  footerSub: { color: 'rgba(90,122,99,0.5)', fontSize: 10, textAlign: 'center', lineHeight: 14 },
  footerVersion: { color: 'rgba(90,122,99,0.4)', fontSize: 10, marginTop: 2 },
});
