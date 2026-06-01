import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWorldStore } from '../../stores/useWorldStore';
import { mockWorlds, mockMessagesMap } from '../../mocks/mockWorlds';
import styles from './WorldHub.module.css';

/* ── Mock 开关 ── */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

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
  const sealWorld = useWorldStore(s => s.sealWorld);
  const navigate = useNavigate();

  /* ── Mock 模式：使用模拟数据；否则走真实 store ── */
  const worlds = USE_MOCK
    ? mockWorlds.filter(w => !w.isSealed)
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

  /* ── 封存弹窗 ── */
  const [sealTarget, setSealTarget] = useState<string | null>(null);
  const handleSeal = useCallback(async () => {
    if (!sealTarget) return;
    await sealWorld(sealTarget);
    setSealTarget(null);
  }, [sealTarget, sealWorld]);

  /* ── 消息弹窗 ── */
  const [msgWorldId, setMsgWorldId] = useState<string | null>(null);
  /* 修复：Mock 模式下应从 worlds 中查找，否则从 allWorlds 中查找 */
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

  /* ── Filter Chip 点击 → 导航占位页 ── */
  const handleChipClick = useCallback(
    (key: string) => {
      if (key === 'ash') navigate('/ash');
      else if (key === 'temple') navigate('/temple');
      else if (key === 'time') navigate('/timecapsule');
    },
    [navigate]
  );

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
      {/* ── 搜索栏 + Filter Chips ── */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input
            className={styles.searchInput}
            placeholder="搜索你的世界..."
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
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <span className={styles.featuredTag}>最活跃</span>
                  <h2 className={styles.cardTitleLg}>{featured.name}</h2>
                </div>
                <div className={styles.cardHeaderRight}>
                  <span className={styles.cardTime}>{formatTimeAgo(featured.updatedAt)}</span>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.iconBtn}
                      onClick={e => { e.stopPropagation(); setSealTarget(featured.id); }}
                      title="封存"
                    >
                      <span className="material-symbols-outlined">archive</span>
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={e => { e.stopPropagation(); setMsgWorldId(featured.id); }}
                      title="消息"
                    >
                      <span className="material-symbols-outlined">chat_bubble</span>
                      {(featured.unreadCount ?? 0) > 0 && (
                        <span className={styles.badge}>{featured.unreadCount}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.crystalBall}>
                {featured.imageUrl ? (
                  <img className={styles.crystalImg} src={featured.imageUrl} alt={featured.name} />
                ) : (
                  <div className={styles.crystalPlaceholder} style={{ background: featured.color }}>
                    <span className={styles.crystalEmoji}>{featured.icon || '🔮'}</span>
                  </div>
                )}
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
                {w.imageUrl ? (
                  <img className={styles.crystalImg} src={w.imageUrl} alt={w.name} />
                ) : (
                  <div className={styles.crystalPlaceholder} style={{ background: w.color }}>
                    <span className={styles.crystalEmoji}>{w.icon || '🔮'}</span>
                  </div>
                )}
              </div>
              <div className={styles.cardFooter}>
                <h3 className={styles.cardTitleSm}>{w.name}</h3>
                <div className={styles.cardActions}>
                  <button
                    className={styles.iconBtn}
                    onClick={e => { e.stopPropagation(); setSealTarget(w.id); }}
                    title="封存"
                  >
                    <span className="material-symbols-outlined">archive</span>
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={e => { e.stopPropagation(); setMsgWorldId(w.id); }}
                    title="消息"
                  >
                    <span className="material-symbols-outlined">chat_bubble</span>
                    {(w.unreadCount ?? 0) > 0 && (
                      <span className={styles.badge}>{w.unreadCount}</span>
                    )}
                  </button>
                </div>
              </div>
              <span className={styles.cardTimeSm}>{formatTimeAgo(w.updatedAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── FAB ── */}
      <button
        className={styles.fab}
        onClick={() => navigate('/world/create')}
        aria-label="创建世界"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
      </button>

      {/* ── 封存确认弹窗 ── */}
      {sealTarget && (
        <div className={styles.overlay} onClick={() => setSealTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>确认封存？</h3>
            <p className={styles.modalDesc}>
              封存后，该水晶球将移至记忆圣殿，不再出现在主页。
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setSealTarget(null)}>
                取消
              </button>
              <button className={styles.modalConfirm} onClick={handleSeal}>
                确认封存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 消息弹窗（始终显示，0 条消息时展示「暂无消息」） ── */}
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
