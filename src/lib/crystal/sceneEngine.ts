import type { Entry } from '../../types/entry';
import type { SceneWeights, SceneTemplate } from '../../types/crystal';

const KEYWORD_MAP: Record<string, string[]> = {
  '天空': ['nebula', 'starry_night'],
  '星星': ['nebula', 'starry_night'],
  '宇宙': ['nebula'],
  '大海': ['ocean', 'lake'],
  '海': ['ocean', 'lake'],
  '浪': ['ocean'],
  '森林': ['forest'],
  '树': ['forest'],
  '沙漠': ['desert'],
  '城市': ['city'],
  '下雨': ['rain'],
  '雨': ['rain'],
  '日落': ['sunset'],
  '夕阳': ['sunset'],
  '雪': ['snowy_mountain'],
  '山': ['snowy_mountain'],
  '湖': ['lake'],
  '夜': ['starry_night'],
  '花': ['forest'],
  '春天': ['forest'],
  '秋天': ['desert'],
  '冬天': ['snowy_mountain'],
  '夏天': ['ocean', 'sunset'],
  '旅行': ['city', 'ocean'],
  '家': ['forest', 'rain'],
  '思念': ['rain', 'starry_night'],
  '孤独': ['starry_night', 'rain'],
  '温暖': ['sunset', 'forest'],
  '自由': ['ocean', 'nebula'],
};

export function matchScenes(entry: Entry): SceneWeights {
  const weights: SceneWeights = { default_nebula: 1 };
  const text = `${entry.title} ${entry.content}`.toLowerCase();
  const matched = new Set<string>();

  for (const [keyword, sceneIds] of Object.entries(KEYWORD_MAP)) {
    if (text.includes(keyword)) {
      sceneIds.forEach(sid => {
        matched.add(sid);
        weights[`default_${sid}`] = (weights[`default_${sid}`] || 0) + 1;
      });
    }
  }

  entry.keywords.forEach(kw => {
    const sceneIds = KEYWORD_MAP[kw];
    if (sceneIds) {
      sceneIds.forEach(sid => {
        matched.add(sid);
        weights[`default_${sid}`] = (weights[`default_${sid}`] || 0) + 1.5;
      });
    }
  });

  delete weights['default_nebula'];
  if (matched.size === 0) {
    weights['default_nebula'] = 1;
  }

  return weights;
}

export const SCENE_TEMPLATES: SceneTemplate[] = [
  { id: 'nebula', name: 'Nebula', nameZh: '星云', geometry: 'sphere', colors: [0.5, 0.3, 0.8], particleColor: [0.7, 0.5, 1.0], keywords: ['天空', '星星', '宇宙'] },
  { id: 'ocean', name: 'Ocean', nameZh: '海洋', geometry: 'plane', colors: [0.1, 0.4, 0.8], particleColor: [0.3, 0.6, 1.0], keywords: ['大海', '海', '浪'] },
  { id: 'forest', name: 'Forest', nameZh: '森林', geometry: 'cone', colors: [0.2, 0.6, 0.3], particleColor: [0.4, 0.8, 0.5], keywords: ['森林', '树', '花'] },
  { id: 'desert', name: 'Desert', nameZh: '沙漠', geometry: 'plane', colors: [0.8, 0.6, 0.3], particleColor: [1.0, 0.8, 0.5], keywords: ['沙漠'] },
  { id: 'city', name: 'City', nameZh: '城市', geometry: 'custom', colors: [0.5, 0.5, 0.6], particleColor: [0.8, 0.8, 1.0], keywords: ['城市'] },
  { id: 'rain', name: 'Rain', nameZh: '雨', geometry: 'custom', colors: [0.4, 0.5, 0.7], particleColor: [0.6, 0.7, 0.9], keywords: ['下雨', '雨'] },
  { id: 'sunset', name: 'Sunset', nameZh: '日落', geometry: 'sphere', colors: [0.9, 0.4, 0.2], particleColor: [1.0, 0.6, 0.3], keywords: ['日落', '夕阳'] },
  { id: 'snowy_mountain', name: 'Snowy Mountain', nameZh: '雪山', geometry: 'cone', colors: [0.7, 0.8, 0.9], particleColor: [0.9, 0.95, 1.0], keywords: ['雪', '山'] },
  { id: 'lake', name: 'Lake', nameZh: '湖泊', geometry: 'plane', colors: [0.2, 0.5, 0.7], particleColor: [0.4, 0.7, 0.9], keywords: ['湖'] },
  { id: 'starry_night', name: 'Starry Night', nameZh: '星空', geometry: 'sphere', colors: [0.1, 0.1, 0.3], particleColor: [0.9, 0.9, 1.0], keywords: ['夜', '星星'] },
];

export function getPrimaryScene(weights: SceneWeights): SceneTemplate | null {
  let maxWeight = 0;
  let sceneId = '';
  for (const [key, w] of Object.entries(weights)) {
    if (w > maxWeight) {
      maxWeight = w;
      sceneId = key.replace('default_', '');
    }
  }
  return SCENE_TEMPLATES.find(t => t.id === sceneId) || SCENE_TEMPLATES[0];
}

export function getAccentScenes(weights: SceneWeights, count: number = 2): SceneTemplate[] {
  const entries = Object.entries(weights)
    .sort(([, a], [, b]) => b - a)
    .slice(1, count + 1);
  return entries.map(([key]) => {
    const sceneId = key.replace('default_', '');
    return SCENE_TEMPLATES.find(t => t.id === sceneId)!;
  }).filter(Boolean);
}
