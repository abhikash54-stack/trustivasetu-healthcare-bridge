import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { RootState } from '../store';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'REGIONAL_MANAGER' | 'TEAM_MEMBER';

export function usePermissionGuard(allowedRoles: Role[]) {
  const navigation = useNavigation<any>();
  const role = useSelector((s: RootState) => s.auth.user?.role as Role | undefined);

  // Capture allowedRoles in a ref so it never triggers the effect to re-run.
  // Each call site passes a literal array which would be a new reference every
  // render, causing the effect (and any resulting Alert + goBack) to fire
  // repeatedly. The allowed set is constant per screen, so a ref is correct.
  const allowedRef = useRef(allowedRoles);

  useEffect(() => {
    if (role && !allowedRef.current.includes(role)) {
      Alert.alert('Access Denied', 'You do not have permission to view this screen.');
      navigation.goBack();
    }
  }, [role, navigation]);

  return { hasAccess: role ? allowedRef.current.includes(role) : false };
}
