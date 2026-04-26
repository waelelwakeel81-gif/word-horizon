import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'word_horizon_progress';
const STARS_KEY = 'word_horizon_stars';

export interface GameProgress {
  unlockedLevels: number[];
  completedLevels: number[];
  levelStars: { [levelId: number]: number };
  totalScore: number;
}

const DEFAULT_PROGRESS: GameProgress = {
  unlockedLevels: [1],
  completedLevels: [],
  levelStars: {},
  totalScore: 0,
};

export const loadProgress = async (): Promise<GameProgress> => {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    if (data) return JSON.parse(data);
    return DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
};

export const saveProgress = async (progress: GameProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
};

export const unlockNextLevel = async (currentLevelId: number, stars: number): Promise<GameProgress> => {
  const progress = await loadProgress();
  if (!progress.completedLevels.includes(currentLevelId)) {
    progress.completedLevels.push(currentLevelId);
  }
  progress.levelStars[currentLevelId] = Math.max(progress.levelStars[currentLevelId] || 0, stars);
  const nextLevel = currentLevelId + 1;
  if (!progress.unlockedLevels.includes(nextLevel)) {
    progress.unlockedLevels.push(nextLevel);
  }
  progress.totalScore += stars * 100;
  await saveProgress(progress);
  return progress;
};

export const resetProgress = async (): Promise<void> => {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));
};
