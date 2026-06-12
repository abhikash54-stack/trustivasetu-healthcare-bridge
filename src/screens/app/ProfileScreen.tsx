import { ScrollView, StyleSheet, View, Text as RNText } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { signOut } from '../../store/slices/authSlice';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BRAND } from '../../theme/theme';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrator',
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  RM: 'Regional Manager',
  EMPLOYEE: 'Employee',
};

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialIcons name={icon as any} size={18} color={BRAND.primary} />
      </View>
      <View style={styles.infoText}>
        <RNText style={styles.infoLabel}>{label}</RNText>
        <RNText style={styles.infoValue}>{value}</RNText>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const roleLabel = ROLE_LABELS[user?.role?.toUpperCase() ?? ''] ?? 'Staff Member';
  const empId = `EMP-${(user?.id ?? '000000').slice(0, 6).toUpperCase()}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
    >
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Avatar name={user?.name ?? '?'} size={72} bgColor={BRAND.accent} />
        <RNText style={styles.name}>{user?.name ?? 'User'}</RNText>
        <RNText style={styles.role}>{roleLabel}</RNText>
        <View style={styles.badge}>
          <RNText style={styles.badgeText}>{empId}</RNText>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoCard}>
        <RNText style={styles.sectionTitle}>Account details</RNText>
        <InfoRow icon="email" label="Email" value={user?.email ?? '—'} />
        <InfoRow icon="phone" label="Phone" value={user?.phone ?? '—'} />
        <InfoRow icon="badge" label="Employee ID" value={empId} />
        <InfoRow icon="work" label="Designation" value={roleLabel} />
        <InfoRow icon="supervisor-account" label="Reporting Manager" value="—" />
      </View>

      {/* Sign Out */}
      <View style={{ marginTop: 12 }}>
        <PrimaryButton label="Sign out" onPress={() => dispatch(signOut())} />
      </View>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2D1E',
    marginTop: 14,
    textAlign: 'center',
  },
  role: {
    fontSize: 14,
    color: BRAND.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  badge: {
    backgroundColor: BRAND.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 10,
  },
  badgeText: {
    color: BRAND.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  infoCard: {
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
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF6F1',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#5A7A63',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: '#1A2D1E',
    fontWeight: '500',
    marginTop: 1,
  },
});
