import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar } from './Avatar';
import { RootState } from '../store';
import { signOut } from '../store/slices/authSlice';
import { clearAuthState } from '../services/storageService';
import { tokenManager } from '../api/tokenManager';
import { logout } from '../services/authService';
import { BRAND } from '../theme/theme';
import { APP_INFO } from '../config/environment';

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  roles: string[] | null;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'Dashboard',         label: 'Dashboard',           icon: 'dashboard',              roles: null },
  { key: 'Leads',             label: 'Leads',               icon: 'people',                 roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RM'] },
  { key: 'ClinicOnboarding',  label: 'Clinic Onboarding',   icon: 'local-hospital',         roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RM'] },
  { key: 'Enquiries',         label: 'Enquiries',           icon: 'assignment',             roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RM'] },
  { key: 'Attendance',        label: 'Attendance',          icon: 'fingerprint',            roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'] },
  { key: 'Leave',             label: 'Leave',               icon: 'event-note',             roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'] },
  { key: 'Tasks',             label: 'Tasks',               icon: 'check-circle-outline',   roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RM'] },
  { key: 'Reports',           label: 'Reports',             icon: 'bar-chart',              roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RM'] },
  { key: 'HRPolicies',        label: 'HR Policies',         icon: 'description',            roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'] },
  { key: 'EmployeeDirectory', label: 'Employee Directory',  icon: 'contacts',               roles: ['SUPER_ADMIN', 'ADMIN'] },
  { key: 'Notifications',     label: 'Notifications',       icon: 'notifications-none',     roles: null },
  { key: 'Profile',           label: 'Profile',             icon: 'person-outline',         roles: null },
  { key: 'UserManagement',    label: 'User Management',      icon: 'supervisor-account',     roles: ['SUPER_ADMIN'] },
  { key: 'Settings',          label: 'Settings',            icon: 'settings',               roles: ['SUPER_ADMIN', 'ADMIN'] },
  { key: 'About',             label: 'About TrustivaSetu',  icon: 'info-outline',           roles: null },
];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrator',
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  RM: 'Regional Manager',
  EMPLOYEE: 'Employee',
};

function isVisible(roles: string[] | null, userRole: string): boolean {
  if (roles === null) return true;
  return roles.includes(userRole?.toUpperCase() ?? '');
}

interface DrawerContentProps {
  state: any;
  navigation: any;
}

export function DrawerContent({ state, navigation }: DrawerContentProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  const currentRoute = state?.routes?.[state?.index]?.name ?? 'Dashboard';
  const userRole = user?.role?.toUpperCase() ?? '';
  const roleLabel = ROLE_LABELS[userRole] ?? 'Staff Member';
  const empId = `EMP-${(user?.id ?? '000000').slice(0, 6).toUpperCase()}`;

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          await clearAuthState();
          tokenManager.clearTokens();
          dispatch(signOut());
        },
      },
    ]);
  };

  const visibleItems = MENU_ITEMS.filter((item) => isVisible(item.roles, userRole));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Avatar name={user?.name ?? '?'} size={60} bgColor={BRAND.accent} />
        <Text style={styles.profileName} numberOfLines={1}>{user?.name ?? 'User'}</Text>
        <Text style={styles.profileId}>{empId}</Text>
        <Text style={styles.profileRole}>{roleLabel}</Text>
        <View style={styles.divider} />
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {visibleItems.map((item) => {
          const isActive = currentRoute === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => {
                navigation.navigate(item.key);
                navigation.closeDrawer();
              }}
              activeOpacity={0.75}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={isActive ? BRAND.accent : BRAND.drawerMuted}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.75}>
          <MaterialIcons name="exit-to-app" size={20} color="#E74C3C" style={styles.menuIcon} />
          <Text style={[styles.menuLabel, { color: '#E74C3C' }]}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 8 }} />

        {/* Brand Footer */}
        <View style={styles.brandFooter}>
          <Text style={styles.brandName}>{APP_INFO.name}</Text>
          <Text style={styles.brandTagline}>A Division of Aarthsetu Technologies Pvt Ltd</Text>
          <Text style={styles.brandVersion}>v{APP_INFO.version}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.drawerBg,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'flex-start',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    letterSpacing: 0.2,
  },
  profileId: {
    color: BRAND.drawerMuted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  profileRole: {
    color: BRAND.accent,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: BRAND.drawerBorder,
    alignSelf: 'stretch',
    marginTop: 16,
  },
  menuScroll: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 1,
    borderRadius: 10,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: BRAND.drawerActive,
  },
  menuIcon: {
    width: 26,
  },
  menuLabel: {
    color: BRAND.drawerMuted,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  menuLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeBar: {
    position: 'absolute',
    right: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: BRAND.accent,
  },
  menuDivider: {
    height: 1,
    backgroundColor: BRAND.drawerBorder,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  brandFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BRAND.drawerBorder,
    alignItems: 'flex-start',
  },
  brandName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 13,
  },
  brandVersion: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    marginTop: 3,
  },
});
