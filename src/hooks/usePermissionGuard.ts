import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { RootState } from '../store';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'REGIONAL_MANAGER' | 'TEAM_MEMBER';

export function usePermissionGuard(allowedRoles: Role[]) {
  const navigation = useNavigation<any>();
  const role = useSelector((s: RootState) => s.auth.user?.role as Role | undefined);

  useEffect(() => {
    if (role && !allowedRoles.includes(role)) {
      Alert.alert('Access Denied', 'You do not have permission to view this screen.');
      navigation.goBack();
    }
  }, [role, allowedRoles, navigation]);

  return { hasAccess: role ? allowedRoles.includes(role) : false };
}
