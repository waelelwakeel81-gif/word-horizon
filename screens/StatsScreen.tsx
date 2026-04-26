import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { loadProgress, resetProgress, GameProgress } from '../lib/storage';
import { LEVELS } from '../lib/gameData';
import Ionicons from '@expo/vector-icons/Ionicons';

const StatCard = ({ icon, label, value, color, delay }: { icon: string; label: string; value: string | number; color: string; delay: number }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));
      opacity.value = withDelay(delay, withSpring(1, { damping: 12 }));
      return () => {
        scale.value = 0;
        opacity.value = 0;
      };
    }, [])
  );

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statCard, style]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon as any} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

export const StatsScreen = () => {
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

  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);
  const completionPct = Math.round((progress.completedLevels.length / LEVELS.length) * 100);

  const handleReset = () => {
    Alert.alert(
      'إعادة تعيين',
      'هل تريد حذف كل تقدمك؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم، إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            const fresh = await loadProgress();
            setProgress(fresh);
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#F3E5F5', '#EDE7F6', '#E8EAF6']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>📊 إحصائياتي</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.statsGrid}>
            <StatCard icon="star" label="إجمالي النجوم" value={totalStars} color="#FFB300" delay={0} />
            <StatCard icon="trophy" label="النقاط" value={progress.totalScore} color="#7B1FA2" delay={100} />
            <StatCard icon="checkmark-circle" label="مستويات مكتملة" value={progress.completedLevels.length} color="#2E7D32" delay={200} />
            <StatCard icon="bar-chart" label="نسبة الإتمام" value={`${completionPct}%`} color="#1565C0" delay={300} />
          </View>

          <Text style={styles.sectionTitle}>تفاصيل المستويات</Text>
          {LEVELS.map((level, i) => {
            const isCompleted = progress.completedLevels.includes(level.id);
            const isUnlocked = progress.unlockedLevels.includes(level.id);
            const stars = progress.levelStars[level.id] || 0;
            return (
              <View key={level.id} style={styles.levelRow}>
                <View style={[styles.levelDot, { backgroundColor: isCompleted ? level.color : '#E0E0E0' }]}>
                  <Text style={styles.levelDotText}>{level.id}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelName, { color: isUnlocked ? '#37474F' : '#B0BEC5' }]}>
                    {level.island} {level.title}
                  </Text>
                  <Text style={styles.levelStatus}>
                    {isCompleted ? 'مكتمل ✅' : isUnlocked ? 'غير مكتمل ⏳' : 'مقفل 🔒'}
                  </Text>
                </View>
                <View style={styles.levelStars}>
                  {[1, 2, 3].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= stars ? 'star' : 'star-outline'}
                      size={16}
                      color={s <= stars ? '#FFD700' : '#E0E0E0'}
                    />
                  ))}
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Ionicons name="refresh" size={18} color="#EF5350" />
            <Text style={styles.resetText}>إعادة تعيين التقدم</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#4A148C',
    textAlign: 'center',
    paddingVertical: 20,
    letterSpacing: 1,
  },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
    justifyContent: 'center',
  },
  statCard: {
    width: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#37474F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#90A4AE',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A148C',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  levelDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  levelDotText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  levelStatus: { fontSize: 12, color: '#90A4AE' },
  levelStars: { flexDirection: 'row', gap: 2 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EF5350',
  },
  resetText: { fontSize: 15, color: '#EF5350', fontWeight: '600' },
});
