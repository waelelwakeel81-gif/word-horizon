export interface WordPuzzle {
  id: number;
  emoji: string;
  word: string;
  hint: string;
  letters: string[];
}

export interface Level {
  id: number;
  title: string;
  puzzles: WordPuzzle[];
  island: string;
  color: string;
  bgGradient: [string, string];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'جزيرة البداية',
    island: '🏝️',
    color: '#4CAF50',
    bgGradient: ['#E8F5E9', '#C8E6C9'],
    puzzles: [
      { id: 1, emoji: '🍎', word: 'تفاحة', hint: 'فاكهة حمراء', letters: ['ت', 'ف', 'ا', 'ح', 'ة', 'س', 'م', 'ل'] },
      { id: 2, emoji: '🌙', word: 'قمر', hint: 'يضيء الليل', letters: ['ق', 'م', 'ر', 'ن', 'ج', 'ب'] },
      { id: 3, emoji: '🌊', word: 'بحر', hint: 'ماء واسع', letters: ['ب', 'ح', 'ر', 'ك', 'س', 'ط'] },
      { id: 4, emoji: '☀️', word: 'شمس', hint: 'تشرق صباحاً', letters: ['ش', 'م', 'س', 'ق', 'ر', 'ن'] },
    ],
  },
  {
    id: 2,
    title: 'جزيرة الأزهار',
    island: '🌸',
    color: '#E91E63',
    bgGradient: ['#FCE4EC', '#F8BBD0'],
    puzzles: [
      { id: 1, emoji: '🌹', word: 'وردة', hint: 'زهرة جميلة', letters: ['و', 'ر', 'د', 'ة', 'ن', 'ك', 'س', 'ج'] },
      { id: 2, emoji: '🦋', word: 'فراشة', hint: 'تطير بين الزهور', letters: ['ف', 'ر', 'ا', 'ش', 'ة', 'ق', 'م', 'ل'] },
      { id: 3, emoji: '🌿', word: 'نبات', hint: 'ينمو في التربة', letters: ['ن', 'ب', 'ا', 'ت', 'ق', 'ر', 'س', 'م'] },
      { id: 4, emoji: '🍃', word: 'ورقة', hint: 'من الشجرة', letters: ['و', 'ر', 'ق', 'ة', 'ن', 'ك', 'ب', 'ت'] },
      { id: 5, emoji: '🌺', word: 'زهرة', hint: 'تعطر الجو', letters: ['ز', 'ه', 'ر', 'ة', 'ب', 'ك', 'ن', 'ج'] },
    ],
  },
  {
    id: 3,
    title: 'جزيرة السماء',
    island: '⭐',
    color: '#3F51B5',
    bgGradient: ['#E8EAF6', '#C5CAE9'],
    puzzles: [
      { id: 1, emoji: '⭐', word: 'نجمة', hint: 'تلمع في السماء', letters: ['ن', 'ج', 'م', 'ة', 'ق', 'ر', 'ب', 'س'] },
      { id: 2, emoji: '☁️', word: 'سحاب', hint: 'في السماء', letters: ['س', 'ح', 'ا', 'ب', 'ق', 'ر', 'م', 'ن'] },
      { id: 3, emoji: '🌈', word: 'قوس', hint: 'بعد المطر', letters: ['ق', 'و', 'س', 'ن', 'ر', 'ب', 'م', 'ج'] },
      { id: 4, emoji: '🌤️', word: 'غيمة', hint: 'بيضاء في السماء', letters: ['غ', 'ي', 'م', 'ة', 'ن', 'ك', 'ر', 'ب'] },
      { id: 5, emoji: '🌙', word: 'هلال', hint: 'بداية الشهر', letters: ['ه', 'ل', 'ا', 'ل', 'ن', 'ب', 'ق', 'ر'] },
    ],
  },
  {
    id: 4,
    title: 'جزيرة الحيوانات',
    island: '🦁',
    color: '#FF9800',
    bgGradient: ['#FFF3E0', '#FFE0B2'],
    puzzles: [
      { id: 1, emoji: '🦁', word: 'أسد', hint: 'ملك الغابة', letters: ['أ', 'س', 'د', 'ن', 'ب', 'ق', 'ر', 'م'] },
      { id: 2, emoji: '🐘', word: 'فيل', hint: 'أكبر الحيوانات', letters: ['ف', 'ي', 'ل', 'ق', 'ر', 'ن', 'ب', 'س'] },
      { id: 3, emoji: '🐬', word: 'دلفين', hint: 'يعيش في البحر', letters: ['د', 'ل', 'ف', 'ي', 'ن', 'ب', 'ق', 'ر'] },
      { id: 4, emoji: '🦅', word: 'نسر', hint: 'يحلق عالياً', letters: ['ن', 'س', 'ر', 'ق', 'ب', 'م', 'ج', 'ك'] },
      { id: 5, emoji: '🐢', word: 'سلحفاة', hint: 'بطيئة وصبورة', letters: ['س', 'ل', 'ح', 'ف', 'ا', 'ة', 'ن', 'ب'] },
    ],
  },
  {
    id: 5,
    title: 'جزيرة الكنوز',
    island: '💎',
    color: '#9C27B0',
    bgGradient: ['#F3E5F5', '#E1BEE7'],
    puzzles: [
      { id: 1, emoji: '💎', word: 'ماس', hint: 'أغلى الأحجار', letters: ['م', 'ا', 'س', 'ن', 'ب', 'ق', 'ر', 'ج'] },
      { id: 2, emoji: '👑', word: 'تاج', hint: 'يرتديه الملك', letters: ['ت', 'ا', 'ج', 'ن', 'ب', 'ق', 'ر', 'س'] },
      { id: 3, emoji: '🗝️', word: 'مفتاح', hint: 'يفتح الأبواب', letters: ['م', 'ف', 'ت', 'ا', 'ح', 'ن', 'ب', 'ق'] },
      { id: 4, emoji: '🏆', word: 'كأس', hint: 'جائزة الفائز', letters: ['ك', 'أ', 'س', 'ن', 'ب', 'ق', 'ر', 'م'] },
      { id: 5, emoji: '⚡', word: 'برق', hint: 'يسبق الرعد', letters: ['ب', 'ر', 'ق', 'ن', 'س', 'م', 'ج', 'ك'] },
    ],
  },
];

export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
