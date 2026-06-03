import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorldStore } from '../../stores/useWorldStore';
import { mockWorlds } from '../../mocks/mockWorlds';
import styles from './MemorySanctuary.module.css';

/* ── Mock 开关 ── */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/* ── 展厅主题色 ── */
const HALL_THEMES = [
  { color: '#d7baff', label: '第一展厅' },
  { color: '#ffafd7', label: '第二展厅' },
] as const;

/* ── 将封存世界分成展厅（每厅 2 个） ── */
function splitIntoHalls(worlds: typeof mockWorlds): (typeof mockWorlds)[] {
  const halls: (typeof mockWorlds)[] = [];
  for (let i = 0; i < worlds.length; i += 2) {
    halls.push(worlds.slice(i, i + 2));
  }
  return halls;
}

export default function MemorySanctuary() {
  const navigate = useNavigate();
  const storeWorlds = useWorldStore(s => s.worlds);
  const unsealWorld = useWorldStore(s => s.unsealWorld);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  /* ── 获取封存世界 ── */
  const sealedWorlds = useMemo(() => {
    const all = USE_MOCK
      ? mockWorlds.filter(w => w.isSealed)
      : storeWorlds.filter(w => w.isSealed);
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
  }, [storeWorlds, searchQuery]);

  const halls = useMemo(() => splitIntoHalls(sealedWorlds), [sealedWorlds]);

  /* ── 解封逻辑 ── */
  const handleUnseal = useCallback(async (worldId: string) => {
    await unsealWorld(worldId);
    setConfirmId(null);
    navigate(`/world/${worldId}`);
  }, [unsealWorld, navigate]);

  /* ── 星空粒子背景 ── */
  const starFieldRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = starFieldRef.current;
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const star = document.createElement('div');
      star.className = styles.star!;
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      star.style.setProperty('--glow', `${size * 2}px`);
      container.appendChild(star);
    }
  }, []);

  /* ── 空状态 ── */
  if (sealedWorlds.length === 0) {
    return (
      <div className={styles.page}>
        <div ref={starFieldRef} className={styles.starDust} />
        <div className={styles.scrollArea}>
          <header className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className={styles.title}>记忆圣殿</h1>
            <div className={styles.headerRight}>
              <div className={styles.searchBox}>
                <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                <input
                  className={styles.searchInput}
                  placeholder="搜索记忆..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </header>
          <div className={styles.emptyState}>
            <span className={`material-symbols-outlined ${styles.emptyIcon}`}>museum</span>
            <p className={styles.emptyText}>圣殿中没有封存的记忆</p>
            <p className={styles.emptyHint}>封存一个世界后，它会出现在这里</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── 星空背景 ── */}
      <div ref={starFieldRef} className={styles.starDust} />

      {/* ── 主内容 ── */}
      <div className={styles.scrollArea}>
        {/* ── 头部 ── */}
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className={styles.title}>记忆圣殿</h1>
          <div className={styles.headerRight}>
            <div className={styles.searchBox}>
              <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
              <input
                className={styles.searchInput}
                placeholder="搜索记忆..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* ── 展厅列表 ── */}
        <main className={styles.main}>
          {halls.map((hallWorlds, hallIdx) => {
            const theme = HALL_THEMES[hallIdx % HALL_THEMES.length];
            return (
              <section key={hallIdx} className={styles.hallSection}>
                {/* ── 展厅标题 ── */}
                <div className={styles.hallHeader}>
                  <div className={styles.hallLine} style={{ '--theme-color': theme.color } as React.CSSProperties} />
                  <h2 className={styles.hallTitle} style={{ '--theme-color': theme.color } as React.CSSProperties}>
                    {theme.label}
                  </h2>
                  <div className={`${styles.hallLine} ${styles.hallLineRight}`} style={{ '--theme-color': theme.color } as React.CSSProperties} />
                </div>

                {/* ── 水晶球网格 ── */}
                <div className={styles.grid}>
                  {hallWorlds.map((w, itemIdx) => (
                    <div
                      key={w.id}
                      className={`${styles.item} ${itemIdx % 2 === 1 ? styles.itemOffset : ''}`}
                    >
                      {/* ── 玻璃水晶球（点击进入世界详情） ── */}
                      <div className={styles.sphere} onClick={() => navigate(`/world/${w.id}`)}>
                        <div className={styles.sphereInner}>
                          {w.imageUrl ? (
                            <img src={w.imageUrl} alt={w.name} className={styles.sphereImg} />
                          ) : (
                            <div className={styles.sphereFallback} style={{ background: w.color }}>
                              <span style={{ fontSize: 40 }}>{w.icon || '🔮'}</span>
                            </div>
                          )}
                          <div className={styles.sphereReflection} />
                          <div className={styles.sphereOverlay} />
                          {/* 尘封记忆滤镜 */}
                          <div className={styles.sphereSepia} />
                          <div className={styles.sphereSepiaOverlay} />
                          <div className={styles.sphereDust} />
                        </div>
                      </div>
                      {/* ── 名称 ── */}
                      <span className={styles.itemName}>{w.name}</span>
                      {/* ── 解封按钮 ── */}
                      {confirmId === w.id ? (
                        <div className={styles.confirmBox}>
                          <p className={styles.confirmText}>确定解除封存？</p>
                          <div className={styles.confirmActions}>
                            <button className={styles.confirmCancel} onClick={() => setConfirmId(null)}>取消</button>
                            <button className={styles.confirmOk} onClick={() => handleUnseal(w.id)}>确认</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className={styles.restoreBtn}
                          onClick={() => setConfirmId(w.id)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_fix_high</span>
                          <span>解封</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
