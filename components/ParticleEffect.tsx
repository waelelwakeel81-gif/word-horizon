import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  shape: 'circle' | 'star' | 'square';
}

interface ParticleEffectProps {
  active: boolean;
  type: 'success' | 'confetti' | 'error';
  originX?: number;
  originY?: number;
}

const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

const StarParticle = ({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 60;
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    scale.value = withDelay(delay, withSpring(1 + Math.random() * 0.5));
    translateX.value = withDelay(delay, withTiming(Math.cos(angle) * distance, { duration: 600, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(Math.sin(angle) * distance, { duration: 600, easing: Easing.out(Easing.cubic) }));
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
    }, delay + 500);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          left: x - 6,
          top: y - 6,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
        },
      ]}
    />
  );
};

const ConfettiPiece = ({ startX, color, size, delay }: { startX: number; color: string; size: number; delay: number }) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 200;
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(delay, withTiming(height + 100, { duration: 2500 + Math.random() * 1500, easing: Easing.in(Easing.quad) }));
    translateX.value = withDelay(delay, withTiming(drift, { duration: 2500 + Math.random() * 1500 }));
    rotate.value = withDelay(delay, withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * 3, { duration: 2500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: startX + translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size * 0.6,
          borderRadius: 2,
          backgroundColor: color,
        },
      ]}
    />
  );
};

export const SuccessParticles = ({ active, originX = 0, originY = 0 }: { active: boolean; originX?: number; originY?: number }) => {
  if (!active) return null;
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: i * 30,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p) => (
        <StarParticle key={p.id} x={originX} y={originY} color={p.color} delay={p.delay} />
      ))}
    </View>
  );
};

export const ConfettiRain = ({ active }: { active: boolean }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    startX: Math.random() * width,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 8 + Math.random() * 10,
    delay: Math.random() * 800,
  }));

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]} pointerEvents="none">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} startX={p.startX} color={p.color} size={p.size} delay={p.delay} />
      ))}
    </View>
  );
};
