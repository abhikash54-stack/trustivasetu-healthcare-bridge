import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';

export function TasksScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <Text variant="header" marginBottom="md">
        Tasks
      </Text>
      <View style={styles.empty}>
        <Text variant="title">No tasks assigned</Text>
        <Text variant="secondary" style={styles.hint}>
          Operational tasks assigned to you will appear here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
    padding: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
