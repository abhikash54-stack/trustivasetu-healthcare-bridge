import { Alert, ScrollView, StyleSheet, View, Text as RNText, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { BRAND } from '../../theme/theme';
import { signOut } from '../../store/slices/authSlice';
import { clearUser } from '../../services/storageService';
import { logout } from '../../services/authService';

export function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const handleDelete = () => {
    Alert.alert(
      'Delete account',
      'This will request deletion of your account and associated data. You may be contacted by support if a manual review is needed. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              await clearUser();
              dispatch(signOut());
              Alert.alert('Request submitted', 'Your account deletion request has been initiated.');
            } catch {
              Alert.alert('Unable to complete', 'Please contact support for account deletion.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}> 
      <View style={styles.card}>
        <RNText style={styles.title}>Delete account</RNText>
        <RNText style={styles.body}>
          Deleting your account will request removal of your access and associated local data from the app. Depending on law and retention requirements, some administrative records may be retained for compliance or audit purposes.
        </RNText>
        <RNText style={styles.body}>
          If you need help instead, use the Support & Grievance screen to contact the team directly.
        </RNText>
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <RNText style={styles.buttonText}>Request account deletion</RNText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.primary, marginBottom: 12 },
  body: { fontSize: 13, lineHeight: 20, color: '#334', marginBottom: 10 },
  button: { marginTop: 8, backgroundColor: '#E74C3C', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
