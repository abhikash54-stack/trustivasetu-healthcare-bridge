import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected;
      setIsOnline(online);
      Animated.timing(opacity, {
        toValue: online ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    return unsub;
  }, [opacity]);

  if (isOnline) return null;

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      <Text style={styles.text}>No internet connection — showing cached data</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E74C3C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: { color: '#FFF', fontSize: 12, fontWeight: '600' },
});
