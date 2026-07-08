import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../../theme/theme';
import { BRAND } from '../../theme/theme';
import { APP_INFO } from '../../config/environment';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoleOption {
  key: string;
  title: string;
  route: string;
  params?: Record<string, unknown>;
  primary?: boolean;
}

const ROLES: RoleOption[] = [
  {
    key: 'customer',
    title: 'Patient / Customer',
    route: 'CustomerLogin',
    primary: true,
  },
  {
    key: 'hospital',
    title: 'Hospital / Channel Partner',
    route: 'Login',
    params: { audience: 'hospital', heading: 'Channel Partner Sign In' },
  },
  {
    key: 'employee',
    title: 'Trustiva Setu Employee',
    route: 'Login',
    params: { audience: 'employee', heading: 'Employee Sign In' },
  },
];

export function RoleSelectScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.root}>
      <View style={styles.backdropBase} />
      <View style={styles.backdropGlowTop} />
      <View style={styles.backdropGlowBottom} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.heroSection}>
          <View style={styles.logoRing}>
            <Image source={require('../../../assets/icon.png')} style={styles.logo} />
          </View>
          <Text style={styles.brandName}>{APP_INFO.name}</Text>
          <Text style={styles.welcome}>Welcome</Text>
          <Text style={styles.tagline}>
            India's healthcare financing platform — instant, paperless EMI for
            treatment, on your phone.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.continueAs}>Continue as</Text>
          {ROLES.map((role) => (
            <Pressable
              key={role.key}
              onPress={() => navigation.navigate(role.route, role.params)}
              style={({ pressed }) => [
                styles.button,
                role.primary ? styles.buttonPrimary : styles.buttonSecondary,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={role.title}
            >
              <Text
                style={[
                  styles.buttonText,
                  role.primary ? styles.buttonTextPrimary : styles.buttonTextSecondary,
                ]}
              >
                {role.title}
              </Text>
            </Pressable>
          ))}
          <Text style={styles.footerText}>{APP_INFO.copyright}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND.drawerBg,
  },
  backdropBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND.drawerBg,
  },
  backdropGlowTop: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.25,
    left: -80,
    width: SCREEN_HEIGHT * 0.7,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: SCREEN_HEIGHT * 0.35,
    backgroundColor: BRAND.accent,
    opacity: 0.12,
  },
  backdropGlowBottom: {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.2,
    right: -100,
    width: SCREEN_HEIGHT * 0.6,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: SCREEN_HEIGHT * 0.3,
    backgroundColor: BRAND.accent,
    opacity: 0.2,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2,
    marginBottom: 28,
    textTransform: 'uppercase',
  },
  welcome: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },
  bottomSection: {
    paddingBottom: 12,
  },
  continueAs: {
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: BRAND.accent,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextPrimary: {
    color: '#07111f',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
  },
});
