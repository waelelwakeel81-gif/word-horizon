import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LEVELS } from '../lib/gameData';
import { loadProgress, GameProgress } from '../lib/storage';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const IslandNode = ({
  level,
  isUnlocked,
  isCompleted,
  isNext,
  stars,
  onPress,
  index,
}: {
  level: (typeof LEVELS)[0];
  isUnlocked: boolean;
  isCompleted: boolean;
  isNext: boolean;
  stars: number;
  onPress: () => void;
  index: number;
}) => {
  const scale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(index * 150, withSpring(1, { damping: 12, stiffness: 100 }));

    if (isNext) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.2, { duration: 900, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 900 }),
          withTiming(1, { duration: 900 })
        ),
        -1,
        false
      );
    }
  }, [isNext]);

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const isLeft = index % 2 === 0;

  return (
    <View style={[styles.islandRow, { justifyContent: isLeft ? 'flex-start' : 'flex-end' }]}>
      <Animated.View style={nodeStyle}>
        <TouchableOpacity
          onPress={onPress}
          disabled={!isUnlocked}
          activeOpacity={0.8}
          style={styles.islandWrapper}
        >
          {isNext && (
            <Animated.View
              style={[
                styles.glowRing,
                { borderColor: level.color },
                glowStyle,
              ]}
            />
          )}
          <View
            style={[
              styles.islandNode,
              {
                backgroundColor: isUnlocked ? level.color : '#B0BEC5',
                shadowColor: isUnlocked ? level.color : '#90A4AE',
                opacity: isUnlocked ? 1 : 0.6,
              },
            ]}
          >
            <Text style={styles.islandEmoji}>{isUnlocked ? level.island : '🔒'}</Text>
            <Text style={styles.levelNum}>{level.id}</Text>
          </View>
          <Text style={[styles.islandTitle, { color: isUnlocked ? '#37474F' : '#90A4AE' }]}>
            {level.title}
          </Text>
          {isCompleted && (
            <View style={styles.starsRow}>
              {[1, 2, 3].map((s) => (
                <Ionicons
                  key={s}
                  name={s <= stars ? 'star' : 'star-outline'}
                  size={14}
                  color={s <= stars ? '#FFD700' : '#B0BEC5'}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const MapScreen = ({ navigation }: { navigation: any }) => {
  const [progress, setProgress] = useState<GameProgress>({
    unlockedLevels: [1],
    completedLevels: [],
    levelStars: {},
    totalScore: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadProgress().then(setProgress);
    }, [])
  );

  const headerAnim = useSharedValue(0);
  useEffect(() => {
    headerAnim.value = withTiming(1, { duration: 600 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerAnim.value,
    transform: [{ translateY: (1 - headerAnim.value) * -20 }],
  }));

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2', '#E8F5E9']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.header, headerStyle]}>
          <Text style={styles.headerTitle}>🌅 أفق الكلمات</Text>
          <View style={styles.scoreChip}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.scoreText}>{progress.totalScore}</Text>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.mapContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mapLabel}>خريطة المستويات</Text>
          {LEVELS.map((level, index) => {
            const isUnlocked = progress.unlockedLevels.includes(level.id);
            const isCompleted = progress.completedLevels.includes(level.id);
            const isNext = isUnlocked && !isCompleted;
            const stars = progress.levelStars[level.id] || 0;
            return (
              <IslandNode
                key={level.id}
                level={level}
                isUnlocked={isUnlocked}
                isCompleted={isCompleted}
                isNext={isNext}
                stars={stars}
                index={index}
                onPress={() =>
                  navigation.navigate('Game', { levelId: level.id })
                }
              />
            );
          })}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E' },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreText: { fontSize: 16, fontWeight: '700', color: '#37474F' },
  mapContent: { paddingHorizontal: 24, paddingTop: 8 },
  mapLabel: {
    fontSize: 14,
    color: '#78909C',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
  },
  islandRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  islandWrapper: { alignItems: 'center', paddingVertical: 8 },
  glowRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    top: -8,
    left: -8,
  },
  islandNode: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  islandEmoji: { fontSize: 28 },
  levelNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    position: 'absolute',
    bottom: 6,
    right: 10,
  },
  islandTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 110,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  bottomSpace: { height: 40 },
});
