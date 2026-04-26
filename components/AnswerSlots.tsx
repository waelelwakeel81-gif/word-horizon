import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

interface AnswerSlotsProps {
  word: string;
  selectedLetters: string[];
  isCorrect: boolean | null;
  isWrong: boolean;
}

const Slot = ({
  letter,
  index,
  isCorrect,
  isWrong,
  total,
}: {
  letter: string;
  index: number;
  isCorrect: boolean | null;
  isWrong: boolean;
  total: number;
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const bounceY = useSharedValue(0);

  useEffect(() => {
    if (letter) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10 })
      );
      bounceY.value = withSequence(
        withTiming(-6, { duration: 100 }),
        withSpring(0, { damping: 8 })
      );
    }
  }, [letter]);

  useEffect(() => {
    if (isCorrect) {
      glow.value = withDelay(
        index * 80,
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0.4, { duration: 300 })
        )
      );
      scale.value = withDelay(
        index * 80,
        withSequence(
          withSpring(1.3, { damping: 6, stiffness: 300 }),
          withSpring(1, { damping: 10 })
        )
      );
    }
  }, [isCorrect]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: bounceY.value }],
  }));

  const slotWidth = Math.min(52, Math.floor(300 / total) - 6);

  return (
    <Animated.View style={animStyle}>
      <View
        style={[
          styles.slot,
          {
            width: slotWidth,
            height: slotWidth,
            borderRadius: slotWidth / 5,
            backgroundColor: isCorrect
              ? '#E8F5E9'
              : isWrong && letter
              ? '#FFEBEE'
              : letter
              ? '#E3F2FD'
              : '#F5F5F5',
            borderColor: isCorrect
              ? '#4CAF50'
              : isWrong && letter
              ? '#EF5350'
              : letter
              ? '#42A5F5'
              : '#E0E0E0',
            shadowColor: isCorrect ? '#4CAF50' : isWrong ? '#EF5350' : '#42A5F5',
            shadowOpacity: (isCorrect || (isWrong && !!letter)) ? 0.4 : 0.1,
            elevation: letter ? 4 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.letter,
            {
              fontSize: slotWidth > 40 ? 18 : 14,
              color: isCorrect ? '#2E7D32' : isWrong ? '#C62828' : '#1565C0',
            },
          ]}
        >
          {letter || ''}
        </Text>
      </View>
    </Animated.View>
  );
};

export const AnswerSlots: React.FC<AnswerSlotsProps> = ({
  word,
  selectedLetters,
  isCorrect,
  isWrong,
}) => {
  return (
    <View style={styles.container}>
      {word.split('').map((_, i) => (
        <Slot
          key={i}
          letter={selectedLetters[i] || ''}
          index={i}
          isCorrect={isCorrect}
          isWrong={isWrong}
          total={word.length}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    margin: 2,
  },
  letter: {
    fontWeight: '700',
  },
});
