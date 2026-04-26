import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEVELS, shuffleArray } from '../lib/gameData';
import { unlockNextLevel } from '../lib/storage';
import { LetterTile } from '../components/LetterTile';
import { AnswerSlots } from '../components/AnswerSlots';
import { SuccessParticles, ConfettiRain } from '../components/ParticleEffect';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const EmojiDisplay = ({
  emoji,
  hint,
  idle,
}: {
  emoji: string;
  hint: string;
  idle: boolean;
}) => {
  const shakeX = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (idle) {
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 300 }),
          withTiming(4, { duration: 300 }),
          withTiming(-4, { duration: 300 }),
          withTiming(0, { duration: 300 }),
          withTiming(0, { duration: 1400 })
        ),
        -1,
        false
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      shakeX.value = withTiming(0, { duration: 200 });
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [idle]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={[styles.emojiContainer, style]}>
      <Text style={styles.puzzleEmoji}>{emoji}</Text>
      <Text style={styles.hintText}>{hint}</Text>
    </Animated.View>
  );
};

const LevelCompleteModal = ({
  visible,
  stars,
  onNext,
  onMap,
  isLastLevel,
}: {
  visible: boolean;
  stars: number;
  onNext: () => void;
  onMap: () => void;
  isLastLevel: boolean;
}) => {
  const scale = useSharedValue(0);
  const titleBounce = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10, stiffness: 80 });
      titleBounce.value = withDelay(
        300,
        withSequence(
          withSpring(1.2, { damping: 6, stiffness: 200 }),
          withSpring(1, { damping: 10 })
        )
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
      titleBounce.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleBounce.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalCard, modalStyle]}>
          <Animated.Text style={[styles.modalTitle, titleStyle]}>ممتاز! 🎉</Animated.Text>
          <View style={styles.starsRow}>
            {[1, 2, 3].map((s) => {
              const starScale = useSharedValue(0);
              useEffect(() => {
                if (visible) {
                  starScale.value = withDelay(
                    s * 200,
                    withSpring(1, { damping: 8, stiffness: 150 })
                  );
                }
              }, [visible]);
              const starStyle = useAnimatedStyle(() => ({
                transform: [{ scale: starScale.value }],
              }));
              return (
                <Animated.View key={s} style={starStyle}>
                  <Ionicons
                    name={s <= stars ? 'star' : 'star-outline'}
                    size={48}
                    color={s <= stars ? '#FFD700' : '#E0E0E0'}
                  />
                </Animated.View>
              );
            })}
          </View>
          <Text style={styles.modalSub}>أكملت المستوى بنجاح!</Text>
          <View style={styles.modalButtons}>
            {!isLastLevel && (
              <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
                <Text style={styles.nextBtnText}>المستوى التالي ➡️</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.mapBtn} onPress={onMap}>
              <Text style={styles.mapBtnText}>🗺️ الخريطة</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const GameScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { levelId } = route.params;
  const level = LEVELS.find((l) => l.id === levelId)!;
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [levelStars, setLevelStars] = useState(3);
  const [wrongCount, setWrongCount] = useState(0);
  const [particleOrigin, setParticleOrigin] = useState({ x: width / 2, y: height * 0.4 });
  const [idleTimer, setIdleTimer] = useState(false);
  const [shakeLetters, setShakeLetters] = useState(false);
  const [particleKey, setParticleKey] = useState(0);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const puzzle = level.puzzles[puzzleIndex];

  const progressAnim = useSharedValue(0);
  const emojiEntrance = useSharedValue(0);

  useEffect(() => {
    const letters = shuffleArray(puzzle.letters);
    setShuffledLetters(letters);
    setSelectedIndices([]);
    setIsCorrect(null);
    setIsWrong(false);
    setShakeLetters(false);
    emojiEntrance.value = 0;
    emojiEntrance.value = withSpring(1, { damping: 12 });
    startIdleTimer();
  }, [puzzleIndex]);

  useEffect(() => {
    progressAnim.value = withTiming((puzzleIndex) / level.puzzles.length, { duration: 600 });
  }, [puzzleIndex]);

  const startIdleTimer = () => {
    if (idleRef.current) clearTimeout(idleRef.current);
    setIdleTimer(false);
    idleRef.current = setTimeout(() => setIdleTimer(true), 5000);
  };

  useEffect(() => {
    return () => { if (idleRef.current) clearTimeout(idleRef.current); };
  }, []);

  const selectedLetters = selectedIndices.map((i) => shuffledLetters[i]);

  const handleLetterPress = (index: number) => {
    startIdleTimer();
    if (isCorrect || isWrong) return;
    const alreadySelected = selectedIndices.indexOf(index);
    let newSelected: number[];
    if (alreadySelected >= 0) {
      newSelected = selectedIndices.filter((i) => i !== index);
    } else {
      if (selectedIndices.length >= puzzle.word.length) return;
      newSelected = [...selectedIndices, index];
    }
    setSelectedIndices(newSelected);

    if (newSelected.length === puzzle.word.length) {
      const formed = newSelected.map((i) => shuffledLetters[i]).join('');
      if (formed === puzzle.word) {
        handleCorrect();
      } else {
        handleWrong();
      }
    }
  };

  const handleCorrect = () => {
    setIdleTimer(false);
    if (idleRef.current) clearTimeout(idleRef.current);
    setIsCorrect(true);
    setParticleKey((k) => k + 1);

    setTimeout(() => {
      const isLast = puzzleIndex === level.puzzles.length - 1;
      if (isLast) {
        setShowConfetti(true);
        const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
        setLevelStars(stars);
        unlockNextLevel(levelId, stars);
        setTimeout(() => {
          setShowConfetti(false);
          setShowModal(true);
        }, 2800);
      } else {
        setTimeout(() => {
          setIsCorrect(null);
          setPuzzleIndex((p) => p + 1);
        }, 800);
      }
    }, 1200);
  };

  const handleWrong = () => {
    setIsWrong(true);
    setShakeLetters(true);
    setWrongCount((c) => c + 1);
    setTimeout(() => {
      setIsWrong(false);
      setShakeLetters(false);
      setSelectedIndices([]);
    }, 800);
    startIdleTimer();
  };

  const handleHint = () => {
    startIdleTimer();
    const correctLetter = puzzle.word[selectedIndices.length];
    const hintIndex = shuffledLetters.findIndex(
      (l, i) => l === correctLetter && !selectedIndices.includes(i)
    );
    if (hintIndex >= 0) {
      setSelectedIndices((prev) => [...prev, hintIndex]);
      setWrongCount((c) => c + 1);
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    opacity: emojiEntrance.value,
    transform: [{ scale: emojiEntrance.value }],
  }));

  const isLastLevel = levelId === LEVELS[LEVELS.length - 1].id;

  return (
    <LinearGradient colors={level.bgGradient as [string, string]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#37474F" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.levelTitle}>{level.title}</Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: level.color },
                  progressStyle,
                ]}
              />
            </View>
          </View>
          <TouchableOpacity onPress={handleHint} style={styles.hintBtn}>
            <Ionicons name="bulb" size={22} color="#FFB300" />
          </TouchableOpacity>
        </View>

        {/* Puzzle Counter */}
        <Text style={styles.puzzleCounter}>
          {puzzleIndex + 1} / {level.puzzles.length}
        </Text>

        {/* Emoji / Image */}
        <Animated.View style={emojiStyle}>
          <EmojiDisplay
            emoji={puzzle.emoji}
            hint={puzzle.hint}
            idle={idleTimer}
          />
        </Animated.View>

        {/* Answer Slots */}
        <View style={styles.answerArea}>
          <AnswerSlots
            word={puzzle.word}
            selectedLetters={selectedLetters}
            isCorrect={isCorrect}
            isWrong={isWrong}
          />
        </View>

        {/* Wrong Indicator */}
        {isWrong && (
          <View style={styles.wrongDust}>
            <Text style={styles.wrongText}>حاول مرة أخرى 💨</Text>
          </View>
        )}

        {/* Correct Indicator */}
        {isCorrect && (
          <View style={styles.correctBanner}>
            <Text style={styles.correctText}>رائع! ✨</Text>
          </View>
        )}

        {/* Letter Tiles */}
        <View style={styles.lettersArea}>
          <View style={styles.lettersGrid}>
            {shuffledLetters.map((letter, index) => (
              <LetterTile
                key={`${puzzleIndex}-${index}`}
                letter={letter}
                selected={selectedIndices.includes(index)}
                onPress={() => handleLetterPress(index)}
                index={index}
                disabled={!!isCorrect}
                shake={shakeLetters && selectedIndices.includes(index)}
              />
            ))}
          </View>
        </View>

        {/* Clear Button */}
        {selectedIndices.length > 0 && !isCorrect && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { setSelectedIndices([]); startIdleTimer(); }}
          >
            <Ionicons name="close-circle" size={20} color="#78909C" />
            <Text style={styles.clearText}>مسح</Text>
          </TouchableOpacity>
        )}

        {/* Particles */}
        <SuccessParticles
          key={particleKey}
          active={!!isCorrect}
          originX={width / 2}
          originY={height * 0.42}
        />

        <ConfettiRain active={showConfetti} />

        <LevelCompleteModal
          visible={showModal}
          stars={levelStars}
          isLastLevel={isLastLevel}
          onNext={() => {
            setShowModal(false);
            navigation.replace('Game', { levelId: levelId + 1 });
          }}
          onMap={() => {
            setShowModal(false);
            navigation.navigate('Map');
          }}
        />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37474F',
    textAlign: 'center',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  hintBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzleCounter: {
    textAlign: 'center',
    fontSize: 13,
    color: '#78909C',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  emojiContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  puzzleEmoji: {
    fontSize: 90,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  hintText: {
    fontSize: 15,
    color: '#546E7A',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  answerArea: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  wrongDust: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 4,
  },
  wrongText: {
    fontSize: 14,
    color: '#EF5350',
    fontWeight: '600',
  },
  correctBanner: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 4,
  },
  correctText: {
    fontSize: 18,
    color: '#43A047',
    fontWeight: '800',
  },
  lettersArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    marginBottom: 8,
  },
  clearText: {
    fontSize: 15,
    color: '#78909C',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A237E',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalSub: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 28,
    textAlign: 'center',
  },
  modalButtons: { width: '100%', gap: 12 },
  nextBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  mapBtn: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  mapBtnText: { fontSize: 16, fontWeight: '600', color: '#546E7A' },
});
