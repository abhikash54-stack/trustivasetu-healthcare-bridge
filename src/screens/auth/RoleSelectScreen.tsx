import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { APP_INFO } from '../../config/environment';

interface RoleOption {
  key: string;
  title: string;
  subtitle: string;
  emoji: string;
  route: string;
  params?: Record<string, unknown>;
}

const ROLES: RoleOption[] = [
  {
    key: 'employee',
    title: 'Trustiva Setu Employee',
    subtitle: 'Staff, RM & admin sign in',
    emoji: '🧑\u200d💼',
    route: 'Login',
    params: { audience: 'employee', heading: 'Employee Sign In' },
  },
  {
    key: 'hospital',
    title: 'Hospital / Channel Partner',
    subtitle: 'Clinic staff portal sign in',
    emoji: '🏥',
    route: 'Login',
    params: { audience: 'hospital', heading: 'Channel Partner Sign In' },
  },
  {
    key: 'customer',
    title: 'Patient / Customer',
    subtitle: 'Check your loan & EMI status',
    emoji: '👤',
    route: 'CustomerLogin',
  },
];

export function RoleSelectScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.brandBlock}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.appName}>{APP_INFO.name}</Text>
        <Text style={styles.tagline}>{APP_INFO.tagline}</Text>
      </View>

      <Text style={styles.promptText}>Continue as</Text>

      <View style={styles.cardStack}>
        {ROLES.map((role) => (
          <Pressable
            key={role.key}
            onPress={() => navigation.navigate(role.route, role.params)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            accessibilityRole="button"
            accessibilityLabel={role.title}
          >
            <Text style={styles.cardEmoji}>{role.emoji}</Text>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>{role.title}</Text>
              <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.footerText}>{APP_INFO.copyright}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: 32,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND.primaryDark,
  },
  tagline: {
    fontSize: 13,
    color: '#5A7A63',
    marginTop: 4,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2D1E',
    marginTop: 28,
    marginBottom: 12,
  },
  cardStack: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DCEAE1',
    shadowColor: BRAND.primaryDark,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardPressed: {
    backgroundColor: BRAND.primaryLight,
    borderColor: BRAND.accent,
  },
  cardEmoji: {
    fontSize: 26,
    marginRight: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2D1E',
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#5A7A63',
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: '#9AB3A2',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9AB3A2',
    marginBottom: 20,
  },
});
