import { StyleSheet, View } from 'react-native';
import { Text } from '../../theme/theme';

export function AgreementsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Agreements
      </Text>
      <View style={styles.empty}>
        <Text variant="title">No agreements on file</Text>
        <Text variant="secondary" style={styles.hint}>
          Financial contracts and clinic onboarding agreements will appear here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
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
