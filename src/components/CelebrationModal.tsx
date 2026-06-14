import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { ConfettiEffect } from './ConfettiEffect';
import { OccasionMatch } from '../types/auth';
import { BRAND } from '../theme/theme';

const { width: W } = Dimensions.get('window');

interface Props {
  visible: boolean;
  occasions: OccasionMatch[];
  onDismiss: () => void;
}

export function CelebrationModal({ visible, occasions, onDismiss }: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.6);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible || occasions.length === 0) return null;

  const primary = occasions[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <ConfettiEffect active={visible} count={60} />

        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          {/* Top decoration */}
          <View style={styles.topBar} />

          {/* Emoji */}
          <Text style={styles.emoji}>{primary.emoji}</Text>

          {/* Title */}
          <Text style={styles.title}>{primary.label}</Text>

          {/* Primary message */}
          <Text style={styles.message}>{primary.message}</Text>

          {/* Additional occasions */}
          {occasions.length > 1 && (
            <View style={styles.extraOccasions}>
              {occasions.slice(1).map((occ, i) => (
                <View key={i} style={styles.extraOcc}>
                  <Text style={styles.extraEmoji}>{occ.emoji}</Text>
                  <Text style={styles.extraLabel}>{occ.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* From team */}
          <View style={styles.fromTeam}>
            <Text style={styles.fromTeamText}>With love from the TrustivaSetu Team 💚</Text>
          </View>

          {/* Dismiss button */}
          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.dismissText}>Thank you! 🙏</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    width: Math.min(W - 48, 380),
    alignItems: 'center',
    elevation: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: BRAND.accent,
  },
  emoji: {
    fontSize: 64,
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A2D1E',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#3D5C45',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 16,
    fontWeight: '500',
  },
  extraOccasions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  extraOcc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  extraEmoji: { fontSize: 16 },
  extraLabel: { fontSize: 12, fontWeight: '700', color: BRAND.primary },
  fromTeam: {
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  fromTeamText: {
    fontSize: 13,
    color: BRAND.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
