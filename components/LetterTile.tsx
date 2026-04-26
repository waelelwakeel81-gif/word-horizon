import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface LetterTileProps {
  letter: string;
  selected: boolean;
  onPress: () => void;
  index: number;
  disabled?: boolean;
  shake?: boolean;
  size?: 'normal' | 'large';
}

export const LetterTile: React.FC<LetterTileProps> = ({
  letter,
  selected,
  onPress,
  index,
  disabled = false,
  shake = false,
  size = 'normal',
}) => {
  const scale = useSharedValue(1);
  const brightness = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const mountAnim = useSharedValue(0);

  useEffect(() => {
    mountAnim.value = withSpring(1, { delay: index * 50 } as any);
  }, []);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.15, { damping: 10, stiffness: 300 });
      brightness.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      brightness.value = withTiming(0, { duration: 200 });
    }
  }, [selected]);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(-3, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [shake]);

  const handlePress = () => {
    if (!disabled) {
      scale.value = withSequence(
        withSpring(0.9, { damping: 8, stiffness: 400 }),
        withSpring(selected ? 1.15 : 1, { damping: 10, stiffness: 300 })
      );
      onPress();
    }
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * mountAnim.value },
      { translateX: shakeX.value },
    ],
    opacity: mountAnim.value,
  }));

  const tileSize = size === 'large' ? 60 : 52;
  const fontSize = size === 'large' ? 22 : 18;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[
          styles.tile,
          {
            width: tileSize,
            height: tileSize,
            borderRadius: tileSize / 4,
            backgroundColor: selected ? '#4CAF50' : '#FFFFFF',
            borderColor: selected ? '#2E7D32' : '#B0BEC5',
            shadowColor: selected ? '#4CAF50' : '#90A4AE',
            shadowOpacity: selected ? 0.5 : 0.2,
            shadowRadius: selected ? 8 : 4,
            elevation: selected ? 8 : 3,
          },
        ]}
      >
        <Text
          style={[
            styles.letter,
            {
              fontSize,
              color: selected ? '#FFFFFF' : '#37474F',
            },
          ]}
        >
          {letter}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 2,
  },
  letter: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
