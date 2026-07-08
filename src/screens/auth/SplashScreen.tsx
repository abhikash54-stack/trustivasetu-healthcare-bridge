import { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type SplashNavigationProp = any;

export function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('RoleSelect'), 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>TrustivaSetu Healthcare Bridge</Text>
      </View>
      <Text style={styles.subtitle}>Payments, partner networks and patient progress in one secure place.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B71EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#E6F4FE',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
});
