const EMOTION_KEYWORDS: Record<string, { hue: number; category: 'positive' | 'negative' | 'neutral' }> = {
  '开心': { hue: 45, category: 'positive' },
  '快乐': { hue: 45, category: 'positive' },
  '幸福': { hue: 40, category: 'positive' },
  '感恩': { hue: 50, category: 'positive' },
  '兴奋': { hue: 30, category: 'positive' },
  '期待': { hue: 55, category: 'positive' },
  '感动': { hue: 35, category: 'positive' },
  '温暖': { hue: 25, category: 'positive' },
  '自由': { hue: 60, category: 'positive' },
  '平静': { hue: 180, category: 'neutral' },
  '放松': { hue: 170, category: 'neutral' },
  '思考': { hue: 200, category: 'neutral' },
  '焦虑': { hue: 280, category: 'negative' },
  '悲伤': { hue: 240, category: 'negative' },
  '愤怒': { hue: 0, category: 'negative' },
  '孤独': { hue: 260, category: 'negative' },
  '思念': { hue: 220, category: 'negative' },
  '伤感': { hue: 250, category: 'negative' },
  '失望': { hue: 270, category: 'negative' },
  '恐惧': { hue: 300, category: 'negative' },
};

export function analyzeEmotion(text: string): { emotion: string; hue: number; category: string } {
  let bestMatch = '平静';
  let bestScore = 0;
  let bestHue = 180;
  let bestCategory = 'neutral';

  for (const [emotion, data] of Object.entries(EMOTION_KEYWORDS)) {
    if (text.includes(emotion)) {
      const score = emotion.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = emotion;
        bestHue = data.hue;
        bestCategory = data.category;
      }
    }
  }

  return { emotion: bestMatch, hue: bestHue, category: bestCategory };
}

export function getEmotionHue(emotion: string): number {
  return EMOTION_KEYWORDS[emotion]?.hue ?? 180;
}

export const EMOTION_TAGS = Object.entries(EMOTION_KEYWORDS).map(([name, data]) => ({
  name,
  hue: data.hue,
  category: data.category,
}));
