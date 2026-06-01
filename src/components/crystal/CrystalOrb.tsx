import { useMemo } from 'react';
import styles from './CrystalOrb.module.css';

/* ── 场景预设：根据世界主题映射到内部景观 ── */
const SCENE_PRESETS: Record<string, { bg: string; ground: string; accent: string; particles: string }> = {
  nebula:    { bg: 'radial-gradient(ellipse at 50% 30%, #4a3b6b 0%, #1a0f2e 60%, #0d0618 100%)', ground: '#2d1b4e', accent: '#8b7ec8', particles: '#c4b5fd' },
  ocean:     { bg: 'radial-gradient(ellipse at 50% 30%, #1e5a7a 0%, #0d3a52 60%, #061e2e 100%)', ground: '#134b6b', accent: '#5bc0de', particles: '#a8e6f0' },
  forest:    { bg: 'radial-gradient(ellipse at 50% 30%, #2d5a3d 0%, #1a3a26 60%, #0d1f14 100%)', ground: '#1e4a2e', accent: '#6bc47a', particles: '#b8f0c4' },
  desert:    { bg: 'radial-gradient(ellipse at 50% 30%, #8b6f47 0%, #5a4528 60%, #2e2210 100%)', ground: '#6b5228', accent: '#d4a574', particles: '#f0d4a8' },
  city:      { bg: 'radial-gradient(ellipse at 50% 30%, #4a4a5a 0%, #2a2a3a 60%, #151520 100%)', ground: '#3a3a48', accent: '#f0c878', particles: '#ffe4a0' },
  rain:      { bg: 'radial-gradient(ellipse at 50% 30%, #3a4a5a 0%, #1e2a3a 60%, #0f151e 100%)', ground: '#2a3a4a', accent: '#7aa8c8', particles: '#c0d8e8' },
  sunset:    { bg: 'radial-gradient(ellipse at 50% 30%, #8b4a2a 0%, #5a2a1a 60%, #2e1208 100%)', ground: '#6b3818', accent: '#f0a060', particles: '#ffd4a0' },
  snowy_mountain: { bg: 'radial-gradient(ellipse at 50% 30%, #5a6a7a 0%, #3a4a5a 60%, #1e2a3a 100%)', ground: '#4a5a6a', accent: '#c8d8e8', particles: '#e8f0f8' },
  lake:      { bg: 'radial-gradient(ellipse at 50% 30%, #2a5a6a 0%, #1a3a48 60%, #0d1e28 100%)', ground: '#1e4a5a', accent: '#6ab8c8', particles: '#a8e0f0' },
  starry_night: { bg: 'radial-gradient(ellipse at 50% 30%, #1a1a3a 0%, #0d0d1e 60%, #050510 100%)', ground: '#12122a', accent: '#a0a0d0', particles: '#e0e0f8' },
};

function getScenePreset(color: string, sceneId?: string) {
  if (sceneId && SCENE_PRESETS[sceneId]) return SCENE_PRESETS[sceneId];
  // 根据颜色哈希映射到场景
  const colors = Object.keys(SCENE_PRESETS);
  let hash = 0;
  for (let i = 0; i < color.length; i++) hash = color.charCodeAt(i) + ((hash << 5) - hash);
  return SCENE_PRESETS[colors[Math.abs(hash) % colors.length]];
}

interface Props {
  color?: string;
  sceneId?: string;
  icon?: string;
  size?: 'large' | 'small';
}

export default function CrystalOrb({ color = '#625f50', sceneId, icon, size = 'large' }: Props) {
  const preset = useMemo(() => getScenePreset(color, sceneId), [color, sceneId]);

  return (
    <div className={`${styles.orbContainer} ${size === 'small' ? styles.orbSmall : ''}`}>
      {/* 发光底座 */}
      <div className={styles.orbBase} style={{ background: `radial-gradient(ellipse at 50% 40%, ${color}66 0%, transparent 70%)` }} />
      
      {/* 球体外壳 - 玻璃质感 */}
      <div className={styles.orbShell}>
        {/* 内部场景背景 */}
        <div className={styles.orbScene} style={{ background: preset.bg }}>
          {/* 地面/雪地 */}
          <div className={styles.orbGround} style={{ background: `radial-gradient(ellipse at 50% 100%, ${preset.ground} 0%, transparent 70%)` }} />
          
          {/* 中心建筑/元素 */}
          <div className={styles.orbCenter}>
            <div className={styles.orbHouse} style={{ background: preset.accent }}>
              <div className={styles.orbRoof} />
              <div className={styles.orbWindow} />
            </div>
          </div>
          
          {/* 两侧装饰树 */}
          <div className={styles.orbTreeLeft} style={{ borderBottomColor: preset.accent }} />
          <div className={styles.orbTreeRight} style={{ borderBottomColor: preset.accent }} />
          
          {/* 飘雪粒子层 */}
          <div className={styles.orbParticles}>
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className={styles.particle}
                style={{
                  '--px': `${20 + Math.random() * 60}%`,
                  '--py': `${10 + Math.random() * 40}%`,
                  '--delay': `${Math.random() * 4}s`,
                  '--duration': `${3 + Math.random() * 3}s`,
                  '--size': `${1 + Math.random() * 2}px`,
                  background: preset.particles,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
        
        {/* 玻璃折射层 */}
        <div className={styles.orbGlass}>
          {/* 主高光 - 左上 */}
          <div className={styles.orbHighlightMain} />
          {/* 次高光 - 右上边缘 */}
          <div className={styles.orbHighlightSec} />
          {/* 底部反射 */}
          <div className={styles.orbReflect} />
          {/* 边缘光晕 */}
          <div className={styles.orbRim} style={{ boxShadow: `inset 0 0 20px ${color}33, inset 0 0 8px ${color}22` }} />
        </div>
        
        {/* 图标覆盖（如果有） */}
        {icon && (
          <div className={styles.orbIcon}>
            <span>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
