import { ScrollView, StyleSheet, TouchableOpacity, View, Text as RNText } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { signOut } from '../../store/slices/authSlice';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BRAND } from '../../theme/theme';
import { clearUser } from '../../services/storageService';
import { logout } from '../../services/authService';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrator',
  ADMIN: 'Administrator',
  REGIONAL_MANAGER: 'Regional Manager',
  TEAM_MEMBER: 'Team Member',
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

function ActionRow({ icon, label, onPress, destructive }: { icon: string; label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.infoIcon, destructive && styles.infoIconDestructive]}>
        <MaterialIcons name={icon as any} size={18} color={destructive ? '#E74C3C' : BRAND.primary} />
      </View>
      <RNText style={[styles.actionLabel, destructive && styles.actionLabelDestructive]}>
        {label}
      </RNText>
      <MaterialIcons name="chevron-right" size={20} color={destructive ? '#E74C3C' : '#CCC'} />
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const roleLabel = ROLE_LABELS[user?.role?.toUpperCase() ?? ''] ?? 'Staff Member';
  const empId = `EMP-${(user?.id ?? '000000').slice(0, 6).toUpperCase()}`;

  const handleSignOut = async () => {
    await logout();
    await clearUser();
    dispatch(signOut());
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
    >
      <View style={styles.profileCard}>
        <Avatar name={user?.name ?? '?'} size={72} bgColor={BRAND.accent} />
        <RNText style={styles.name}>{user?.name ?? 'User'}</RNText>
        <RNText style={styles.role}>{roleLabel}</RNText>
        <View style={styles.badge}>
          <RNText style={styles.badgeText}>{empId}</RNText>
        </View>
      </View>

      <View style={styles.infoCard}>
        <RNText style={styles.sectionTitle}>Account details</RNText>
        <InfoRow icon="email" label="Email" value={user?.email ?? '—'} />
        <InfoRow icon="phone" label="Phone" value={user?.phone ?? '—'} />
        <InfoRow icon="badge" label="Employee ID" value={empId} />
        <InfoRow icon="work" label="Designation" value={roleLabel} />
      </View>

      <View style={styles.infoCard}>
        <RNText style={styles.sectionTitle}>Quick Access</RNText>
        <ActionRow
          icon="support-agent"
          label="Partner Assistant"
          onPress={() => navigation.navigate('Chatbot')}
        />
        <ActionRow
          icon="celebration"
          label="Special Occasions"
          onPress={() => navigation.navigate('Occasions')}
        />
      </View>

      <View style={styles.infoCard}>
        <RNText style={styles.sectionTitle}>Security</RNText>
        <ActionRow
          icon="lock-reset"
          label="Change password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </View>

      <View style={{ marginTop: 8 }}>
        <PrimaryButton label="Sign out" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20 },
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
  name: { fontSize: 20, fontWeight: '700', color: '#1A2D1E', marginTop: 14, textAlign: 'center' },
  role: { fontSize: 14, color: BRAND.primary, fontWeight: '600', marginTop: 4 },
  badge: {
    backgroundColor: BRAND.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 10,
  },
  badgeText: { color: BRAND.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
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
  infoIconDestructive: { backgroundColor: '#FDECEA' },
  infoText: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: '#5A7A63',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  infoValue: { fontSize: 14, color: '#1A2D1E', fontWeight: '500', marginTop: 1 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionLabel: { flex: 1, fontSize: 14, color: '#1A2D1E', fontWeight: '500', marginLeft: 12 },
  actionLabelDestructive: { color: '#E74C3C' },
});
