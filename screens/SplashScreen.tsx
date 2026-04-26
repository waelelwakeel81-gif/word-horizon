import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const FloatingLetter = ({ letter, x, y, delay, color }: { letter: string; x: number; y: number; delay: number; color: string }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const floatY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.6, { duration: 800 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 12 }));
    setTimeout(() => {
      floatY.value = withSequence(
        withTiming(-12, { duration: 1500 + Math.random() * 500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500 + Math.random() * 500, easing: Easing.inOut(Easing.sin) })
      );
    }, delay + 800);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value + floatY.value }],
  }));

  return (
    <Animated.View style={[style, { position: 'absolute', left: x, top: y }]}>
      <View style={[styles.floatingTile, { backgroundColor: color }]}>
        <Text style={styles.floatingLetter}>{letter}</Text>
      </View>
    </Animated.View>
  );
};

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.5);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);

  useEffect(() => {
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    titleScale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 100 }));
    subtitleOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(1800, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(1800, withSpring(1, { damping: 10 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const floatingLetters = [
    { letter: 'أ', x: 20, y: 80, delay: 200, color: '#FF8A65' },
    { letter: 'ف', x: width - 70, y: 100, delay: 350, color: '#4DB6AC' },
    { letter: 'ق', x: 40, y: height * 0.6, delay: 500, color: '#7986CB' },
    { letter: 'ك', x: width - 80, y: height * 0.55, delay: 650, color: '#F06292' },
    { letter: 'م', x: width * 0.1, y: height * 0.35, delay: 800, color: '#81C784' },
    { letter: 'ن', x: width * 0.8, y: height * 0.35, delay: 950, color: '#FFB74D' },
    { letter: 'ه', x: width * 0.15, y: height * 0.72, delay: 300, color: '#4DD0E1' },
    { letter: 'و', x: width * 0.75, y: height * 0.72, delay: 450, color: '#CE93D8' },
  ];

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {floatingLetters.map((fl, i) => (
          <FloatingLetter key={i} {...fl} />
        ))}

        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, titleStyle]}>
            <Text style={styles.logoEmoji}>🌅</Text>
            <Text style={styles.title}>أفق الكلمات</Text>
            <Text style={styles.titleEn}>Word Horizon</Text>
          </Animated.View>

          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            اكتشف الكلمات، تحدى نفسك
          </Animated.Text>

          <Animated.View style={[styles.buttonWrap, buttonStyle]}>
            <View style={styles.startButton}>
              <Text style={styles.startText} onPress={onFinish}>
                ابدأ اللعبة ✨
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoEmoji: { fontSize: 80, marginBottom: 12 },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(255,215,0,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleEn: {
    fontSize: 18,
    color: '#90CAF9',
    letterSpacing: 6,
    marginTop: 4,
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: 1,
  },
  buttonWrap: { width: '100%', alignItems: 'center' },
  startButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 50,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  startText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 1,
  },
  floatingTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  floatingLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
