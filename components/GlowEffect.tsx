import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

interface GlowEffectProps {
  active: boolean;
  color?: string;
  style?: object;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  active,
  color = '#4CAF50',
  style,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (active) {
      opacity.value = withSequence(
        withTiming(0.8, { duration: 200 }),
        withTiming(0.3, { duration: 400 }),
        withTiming(0, { duration: 300 })
      );
      scale.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(1.5, { duration: 600 })
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.glow,
        { backgroundColor: color },
        animStyle,
        style,
      ]}
      pointerEvents="none"
    />
  );
};

export const PulsingGlow: React.FC<{ active: boolean; color?: string }> = ({
  active,
  color = '#FFD700',
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0.1, { duration: 800 })
        ),
        -1,
        false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(0.95, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: color, borderRadius: 16 },
        animStyle,
      ]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});
