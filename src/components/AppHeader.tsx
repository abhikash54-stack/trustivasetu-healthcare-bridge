import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Avatar } from './Avatar';
import { RootState } from '../store';
import { BRAND } from '../theme/theme';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  RM: 'Regional Manager',
  EMPLOYEE: 'Employee',
};

interface AppHeaderProps {
  navigation: any;
}

export function AppHeader({ navigation }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.auth.user);

  const roleLabel = ROLE_LABELS[user?.role?.toUpperCase() ?? ''] ?? 'Staff Member';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.left}>
        <Avatar name={user?.name ?? '?'} size={40} bgColor="rgba(255,255,255,0.22)" />
        <View style={styles.userInfo}>
          <Text style={styles.name} numberOfLines={1}>{user?.name ?? 'User'}</Text>
          <Text style={styles.role}>{roleLabel}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Notifications')}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <MaterialIcons name="notifications-none" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.openDrawer()}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <MaterialIcons name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.headerBg,
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  role: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
});
