import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWorldStore } from '../../stores/useWorldStore';
import { mockWorlds, mockMessagesMap } from '../../mocks/mockWorlds';
import styles from './WorldHub.module.css';

/* ── 星星动画注入（仅一次） ── */
const STAR_STYLE_ID = 'star-pulse-style';
if (typeof document !== 'undefined' && !document.getElementById(STAR_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STAR_STYLE_ID;
  style.textContent = `
@keyframes starPulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px gold); }
  50%        { transform: scale(1.25); filter: drop-shadow(0 0 10px gold); }
}`;
  document.head.appendChild(style);
}

/* ── Mock 开关 ── */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/* ── 从渐变/颜色字符串提取光晕 ── */
function glowFromColor(colorStr: string, isLarge: boolean): string {
  const match = colorStr.match(/#[0-9a-fA-F]{6}/);
  if (!match) {
    return isLarge
      ? '0 0 60px rgba(215,186,255,0.4), 0 0 100px rgba(255,121,198,0.25)'
      : '0 0 40px rgba(255,255,255,0.2)';
  }
  const hex = match[0];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isLarge) {
    return `0 0 60px rgba(${r},${g},${b},0.5), 0 0 100px rgba(${r},${g},${b},0.25)`;
  }
  return `0 0 40px rgba(${r},${g},${b},0.4), 0 0 60px rgba(${r},${g},${b},0.2)`;
}

/* ── 时间格式化 ── */
function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}分钟前更新`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前更新`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? '昨天更新' : `${days}天前更新`;
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) + '更新';
}

/* ── 消息类型 ── */
interface Message {
  id: string;
  worldId: string;
  worldName: string;
  content: string;
  timeAgo: string;
}

/* ── 筛选芯片 ── */
const FILTER_CHIPS = [
  { key: 'ash', label: '灰烬模式', icon: 'local_fire_department', colorClass: styles.chipOrange },
  { key: 'temple', label: '记忆圣殿', icon: 'temple_buddhist', colorClass: styles.chipPurple },
  { key: 'time', label: '时光机', icon: 'history', colorClass: styles.chipTeal },
] as const;

export default function WorldHub() {
  const user = useAuthStore(s => s.currentUser);
  const allWorlds = useWorldStore(s => s.worlds);
  const navigate = useNavigate();

  /* ── Mock 模式：使用模拟数据；否则走真实 store ── */
  const worlds = USE_MOCK
    ? mockWorlds.filter(w => !w.isSealed && w.ownerId === 'mock-user')
    : allWorlds.filter(w => w.ownerId === user?.id && !w.isSealed);

  /* ── 搜索 ── */
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return worlds;
    const q = searchQuery.toLowerCase();
    return worlds.filter(
      w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)
    );
  }, [worlds, searchQuery]);

  /* ── 是否搜索无结果 ── */
  const isSearchEmpty = searchQuery.trim().length > 0 && filtered.length === 0;

  /* ── Featured 卡片：按 updatedAt 排序，最活跃的在最前 ── */
  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [filtered]);

  /* ── 消息弹窗 ── */
  const [msgWorldId, setMsgWorldId] = useState<string | null>(null);
  const msgWorld = msgWorldId
    ? (USE_MOCK ? worlds : allWorlds).find(w => w.id === msgWorldId) ?? null
    : null;

  /* 消息数据：Mock 模式走 mockMessagesMap，否则走内联生成 */
  const messages: Message[] = (() => {
    if (!msgWorld) return [];
    if (USE_MOCK) {
      const items = mockMessagesMap[msgWorld.id] ?? [];
      return items.map(m => ({
        id: m.id,
        worldId: msgWorld.id,
        worldName: msgWorld.name,
        content: m.content,
        timeAgo: m.timeAgo,
      }));
    }
    const count = msgWorld.unreadCount ?? 0;
    if (count === 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: `${msgWorld.id}-msg-${i}`,
      worldId: msgWorld.id,
      worldName: msgWorld.name,
      content: '这是一条来自共鸣池的留言…',
      timeAgo: i === 0 ? '刚刚' : `${i}小时前`,
    }));
  })();

  /* ── 第一个世界的 ID（用于记忆圣殿导航） ── */
  const firstWorldId = worlds[0]?.id ?? null;

  /* ── Filter Chip 点击 → 导航占位页 ── */
  const handleChipClick = useCallback(
    (key: string) => {
      if (key === 'ash') navigate('/burn');
      else if (key === 'temple') navigate('/memory-sanctuary');
      else if (key === 'time') navigate('/timecapsule');
    },
    [navigate, firstWorldId]
  );

  /* ── 星空粒子背景 ── */
  const starFieldRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = starFieldRef.current;
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = styles.star!;
      const size = Math.random() * 2;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(star);
    }
  }, []);

  /* ── 空状态 ── */
  if (worlds.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyCrystal}>
            <div className={styles.emptyCrystalInner} />
          </div>
          <h2 className={styles.emptyTitle}>还没有世界</h2>
          <p className={styles.emptyDesc}>创建一个水晶球世界，开始记录你的记忆</p>
          <button className={styles.emptyBtn} onClick={() => navigate('/world/create')}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            创建第一个世界
          </button>
        </div>
      </div>
    );
  }

  const featured = sorted[0];
  const others = sorted.slice(1);

  return (
    <div className={styles.page}>
      {/* ── 星空背景 ── */}
      <div ref={starFieldRef} className={styles.starField} />

      {/* ── 主内容区 ── */}
      <div className={styles.scrollContainer}>
        {/* ── 头部 ── */}
        <header className={styles.header}>
          <h1 className={styles.title}>水晶球世界</h1>
          <button className={styles.headerBtn} onClick={() => navigate('/world/create')}>
            <span className="material-symbols-outlined">add</span>
          </button>
        </header>

        {/* ── 搜索栏 + Filter Chips ── */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              className={styles.searchInput}
              placeholder="寻找记忆..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearBtn}
                onClick={() => setSearchQuery('')}
                aria-label="清除搜索"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            )}
          </div>
          <div className={styles.chipRow}>
            {FILTER_CHIPS.map(chip => (
              <button
                key={chip.key}
                className={styles.chip}
                onClick={() => handleChipClick(chip.key)}
              >
                <div className={`${styles.chipIcon} ${chip.colorClass}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                    {chip.icon}
                  </span>
                </div>
                <span className={styles.chipLabel}>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 搜索无结果 ── */}
        {isSearchEmpty && (
          <div className={styles.searchEmpty}>
            <span className={`material-symbols-outlined ${styles.searchEmptyIcon}`}>search_off</span>
            <p className={styles.searchEmptyText}>未找到相关世界</p>
            <p className={styles.searchEmptyHint}>试试其他关键词吧</p>
          </div>
        )}

        {/* ── Bento Grid ── */}
        {!isSearchEmpty && (
          <div className={styles.grid}>
            {/* Featured 大卡 */}
            {featured && (
              <div
                className={`${styles.card} ${styles.cardFeatured}`}
                onClick={() => navigate(`/world/${featured.id}`)}
              >
                <div className={styles.crystalBall}>
                  <div className={styles.crystalBallInner} style={{ boxShadow: glowFromColor(featured.color, true) }}>
                    {featured.imageUrl ? (
                      <img
                        src={featured.imageUrl}
                        alt={featured.name}
                        className={styles.crystalBallImage}
                      />
                    ) : (
                      <div className={styles.crystalBallFallback} style={{ background: featured.color }}>
                        <span style={{ fontSize: 48 }}>{featured.icon || '🔮'}</span>
                      </div>
                    )}
                    <div className={styles.crystalBallSheen} />
                  </div>
                </div>
                {/* ── 水晶球底座：名字 + 时间 + 星星 ── */}
                <div className={styles.ballBase}>
                  <h2 className={styles.ballBaseName}>{featured.name}</h2>
                  <div className={styles.ballBaseRow}>
                    <span className={styles.ballBaseTime}>{formatTimeAgo(featured.updatedAt)}</span>
                    {/* ⭐ 星星消息按钮 */}
                    <button
                      className={`${styles.iconBtn} ${styles.starBtn}`}
                      onClick={e => { e.stopPropagation(); setMsgWorldId(featured.id); }}
                      title="留言"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'starPulse 1.8s ease-in-out infinite' }}>star</span>
                      {(featured.unreadCount ?? 0) > 0 && (
                        <span className={styles.badge}>{featured.unreadCount}</span>
                      )}
                    </button>
                  </div>
                </div>
                {featured.latestExcerpt && (
                  <p className={styles.excerpt}>&ldquo;{featured.latestExcerpt}&rdquo;</p>
                )}
              </div>
            )}

            {/* 小卡列表 */}
            {others.map(w => (
              <div
                key={w.id}
                className={styles.card}
                onClick={() => navigate(`/world/${w.id}`)}
              >
                <div className={styles.crystalBallSmall}>
                  <div className={styles.crystalBallSmallInner} style={{ boxShadow: glowFromColor(w.color, false) }}>
                    {w.imageUrl ? (
                      <img
                        src={w.imageUrl}
                        alt={w.name}
                        className={styles.crystalBallSmallImage}
                      />
                    ) : (
                      <div className={styles.crystalBallSmallFallback} style={{ background: w.color }}>
                        <span style={{ fontSize: 32 }}>{w.icon || '🔮'}</span>
                      </div>
                    )}
                    <div className={styles.crystalBallSmallSheen} />
                  </div>
                </div>
                {/* ── 小卡底座：名字 + 时间 + 星星 ── */}
                <div className={styles.ballBaseSmall}>
                  <h3 className={styles.ballBaseNameSmall}>{w.name}</h3>
                  <div className={styles.ballBaseRowSmall}>
                    <span className={styles.ballBaseTimeSmall}>{formatTimeAgo(w.updatedAt)}</span>
                    {/* ⭐ 星星消息按钮 */}
                    <button
                      className={`${styles.iconBtn} ${styles.starBtn}`}
                      onClick={e => { e.stopPropagation(); setMsgWorldId(w.id); }}
                      title="留言"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'starPulse 1.8s ease-in-out infinite' }}>star</span>
                      {(w.unreadCount ?? 0) > 0 && (
                        <span className={styles.badge}>{w.unreadCount}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 底部留白给导航栏 */}
        <div className={styles.bottomSpacer} />
      </div>

      {/* ── FAB ── */}
      <button
        className={styles.fab}
        onClick={() => navigate('/world/create')}
        aria-label="创建世界"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
      </button>

      {/* ── 消息弹窗 ── */}
      {msgWorldId && (
        <div className={styles.overlay} onClick={() => setMsgWorldId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>最近消息</h3>
              <button className={styles.modalClose} onClick={() => setMsgWorldId(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {messages.length > 0 ? (
              <div className={styles.msgList}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={styles.msgItem}
                    onClick={() => {
                      setMsgWorldId(null);
                      navigate(`/world/${msg.worldId}#comment-${msg.id}`);
                    }}
                  >
                    <div className={styles.msgMeta}>
                      <span className={styles.msgWorldName}>{msg.worldName}</span>
                      <span className={styles.msgTime}>{msg.timeAgo}</span>
                    </div>
                    <p className={styles.msgContent}>{msg.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.msgEmpty}>
                <span className={`material-symbols-outlined ${styles.msgEmptyIcon}`}>chat_bubble</span>
                <p className={styles.msgEmptyText}>暂无消息</p>
                <p className={styles.msgEmptyHint}>当有人留言时会在这里提醒你</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
