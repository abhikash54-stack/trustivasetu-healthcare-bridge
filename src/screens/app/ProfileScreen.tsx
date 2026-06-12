import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from '../../theme/theme';

import { RootState } from '../../store';
import { signOut } from '../../store/slices/authSlice';
import { SectionCard } from '../../components/SectionCard';
import { PrimaryButton } from '../../components/PrimaryButton';

export function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Profile
      </Text>
      <SectionCard title={user?.name ?? 'User'} subtitle={user?.email ?? 'No email available'}>
        <Text variant="secondary">Role: Healthcare Partner Manager</Text>
      </SectionCard>
      <PrimaryButton label="Sign out" onPress={() => dispatch(signOut())} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    padding: 24,
  },
});
