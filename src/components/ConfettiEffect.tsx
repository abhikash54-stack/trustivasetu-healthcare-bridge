import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, View, Easing } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const COLORS = [
  '#006B3C', '#00A855', '#F39C12', '#E74C3C',
  '#3498DB', '#9B59B6', '#1ABC9C', '#F1C40F',
  '#E67E22', '#2ECC71', '#E91E63', '#00BCD4',
];

interface PieceConfig {
  id: number;
  x: number;
  width: number;
  height: number;
  color: string;
  delay: number;
  duration: number;
  startRotation: number;
  endRotation: number;
  isCircle: boolean;
}

function makePieces(count: number): PieceConfig[] {
  const pieces: PieceConfig[] = [];
  const rng = (min: number, max: number) => min + Math.floor(Math.random() * (max - min));
  for (let i = 0; i < count; i++) {
    const size = rng(6, 16);
    pieces.push({
      id: i,
      x: rng(0, W),
      width: size,
      height: rng(0, 1) === 0 ? size : size * 2,
      color: COLORS[i % COLORS.length],
      delay: rng(0, 1400),
      duration: rng(2200, 4000),
      startRotation: rng(0, 360),
      endRotation: rng(360, 1080),
      isCircle: rng(0, 3) === 0,
    });
  }
  return pieces;
}

function ConfettiPiece({ piece, active }: { piece: PieceConfig; active: boolean }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const rotate = useRef(new Animated.Value(piece.startRotation)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      delay: piece.delay,
      useNativeDriver: true,
    });

    const fall = Animated.timing(translateY, {
      toValue: H + 30,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const spin = Animated.timing(rotate, {
      toValue: piece.endRotation,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const anim = Animated.parallel([fadeIn, fall, spin]);
    anim.start();

    return () => {
      anim.stop();
      translateY.setValue(-20);
      rotate.setValue(piece.startRotation);
      opacity.setValue(0);
    };
  }, [active]);

  const rotateStr = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: piece.x,
          width: piece.width,
          height: piece.height,
          backgroundColor: piece.color,
          borderRadius: piece.isCircle ? piece.width / 2 : 2,
          opacity,
          transform: [{ translateY }, { rotate: rotateStr }],
        },
      ]}
    />
  );
}

interface Props {
  active: boolean;
  count?: number;
}

export function ConfettiEffect({ active, count = 50 }: Props) {
  const pieces = useMemo(() => makePieces(count), [count]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} active={active} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});
