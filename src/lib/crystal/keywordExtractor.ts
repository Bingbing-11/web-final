const CATEGORIES: Record<string, string[]> = {
  nature: ['天空', '大海', '森林', '山', '花', '雪', '湖', '星星', '月亮', '太阳', '雨', '风', '云', '树', '草', '春天', '夏天', '秋天', '冬天'],
  emotion: ['开心', '悲伤', '愤怒', '焦虑', '平静', '感恩', '思念', '孤独', '温暖', '自由', '幸福', '失望', '期待', '恐惧', '感动'],
  life: ['工作', '学习', '朋友', '家人', '旅行', '美食', '运动', '音乐', '电影', '读书', '家', '梦想', '成长'],
  time: ['今天', '昨天', '明天', '回忆', '未来', '过去', '此刻', '清晨', '傍晚', '深夜', '午后'],
};

export function extractKeywords(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const [, keywords] of Object.entries(CATEGORIES)) {
    for (const kw of keywords) {
      if (lower.includes(kw) && !found.includes(kw)) {
        found.push(kw);
      }
    }
  }
  return found.slice(0, 10);
}

export function getKeywordCategories(keyword: string): string[] {
  const cats: string[] = [];
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.includes(keyword)) cats.push(cat);
  }
  return cats;
}
