import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as any, height, borderRadius, opacity: anim },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={120} height={14} style={{ marginBottom: 10 }} />
      <Skeleton height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="75%" height={12} />
    </View>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: '#D5E8DC' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  list: { padding: 16 },
});
