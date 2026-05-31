import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorldStore } from '../../stores/useWorldStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { matchScenes } from '../../lib/crystal/sceneEngine';
import { DEFAULT_CRYSTAL_PARAMS } from '../../lib/crystal/materialEngine';
import CrystalCanvas from '../../components/crystal/CrystalCanvas';
import type { Entry } from '../../types/entry';
import styles from './WorldDetail.module.css';

/* ── 正文截断行数 ── */
const PREVIEW_LINE_CLAMP = 4;

export default function WorldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const world = useWorldStore(s => s.getWorld(id || ''));
  const entries = useEntryStore(s => s.entries.filter(e => e.worldId === id));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  /* 场景权重（水晶球用） */
  const sceneWeights = useMemo(() => {
    if (!entries.length) return { default_nebula: 1 };
    const latest = entries.slice(0, 50);
    const merged: Record<string, number> = {};
    latest.forEach(e => {
      const sw = matchScenes(e);
      for (const [k, v] of Object.entries(sw)) merged[k] = (merged[k] || 0) + v;
    });
    return merged;
  }, [entries]);

  /* 搜索过滤：只搜索当前世界的日记 */
  const filteredEntries = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      e =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.keywords?.some(k => k.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  /* 弹框打开时禁止背景滚动 */
  useEffect(() => {
    if (selectedEntry) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedEntry]);

  /* 点击日记卡片 */
  const handleEntryClick = useCallback((entry: Entry) => {
    // 触觉反馈
    if (navigator.vibrate) navigator.vibrate(10);
    setSelectedEntry(entry);
  }, []);

  /* 关闭弹框 */
  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  if (!world) return <div className={styles.empty}>世界不存在</div>;

  return (
    <div className={styles.page}>
      {/* ── 搜索栏 ── */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索这个世界里的日记…"
        />
      </div>

      {/* ── 世界头部 ── */}
      <div className={styles.worldHeader}>
        <div className={styles.worldInfo}>
          <div className={styles.worldName}>
            <span>{world.icon || '🌍'}</span> {world.name}
            {world.isSealed && <span className={styles.sealedLabel}>已封存</span>}
          </div>
          {world.description && (
            <div className={styles.worldDesc}>{world.description}</div>
          )}
        </div>
      </div>

      {/* ── 水晶球 ── */}
      <div style={{ width: '100%', height: 200, borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20, background: 'linear-gradient(135deg, var(--primary-deeper), var(--primary-dark))', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <CrystalCanvas params={{ ...DEFAULT_CRYSTAL_PARAMS }} sceneWeights={sceneWeights} isSealed={world.isSealed} />
      </div>

      {/* ── 操作按钮 ── */}
      {!world.isSealed && (
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => navigate(`/world/${id}/entry/new`)}>
            ✏️ 写日记
          </button>
          <button className={`${styles.actionBtn} ${styles.actionBtnSecondary}`} onClick={() => navigate(`/world/${id}/settings`)}>
            ⚙️ 设置
          </button>
          <button className={`${styles.actionBtn} ${styles.actionBtnSecondary}`} onClick={() => navigate(`/world/${id}/temple`)}>
            🏛️ 圣殿
          </button>
        </div>
      )}

      {/* ── 日记时间线 ── */}
      <div className={styles.sectionTitle}>
        <span>日记</span>
        <span className={styles.sectionCount}>{filteredEntries.length} 篇</span>
      </div>

      {filteredEntries.length === 0 ? (
        searchQuery ? (
          <div className={styles.searchEmpty}>
            没有找到包含「{searchQuery}」的日记
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            还没有日记，写第一篇吧
          </div>
        )
      ) : (
        <div className={styles.timeline}>
          {filteredEntries.map(entry => {
            const isBurned = entry.status === 'burned';
            const isLong = entry.content.length > 120;

            return (
              <div key={entry.id} className={styles.diaryCard}>
                {/* 时间线圆点 */}
                <div className={`${styles.diaryDot} ${isBurned ? styles.diaryDotBurned : ''}`} />

                {/* 时间 */}
                <div className={styles.diaryTime}>
                  {new Date(entry.createdAt).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                  {' · '}
                  {new Date(entry.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* 卡片主体 */}
                <div
                  className={`${styles.diaryBody} ${isBurned ? styles.diaryBodyFaded : ''}`}
                  onClick={() => !isBurned && handleEntryClick(entry)}
                >
                  {/* 正文（截断） */}
                  <div className={`${styles.diaryContent} ${isLong && !isBurned ? styles.diaryContentTruncated : ''}`}>
                    {isBurned ? (
                      <span className={styles.diaryContentFaded}>
                        "这一页已经随着时间变得模糊……"
                      </span>
                    ) : (
                      entry.content
                    )}
                  </div>

                  {/* 展开提示 */}
                  {isLong && !isBurned && (
                    <div className={styles.diaryExpandHint}>点击查看全文 ↓</div>
                  )}

                  {/* 图片（非绝对定位） */}
                  {!isBurned && entry.keywords?.length > 0 && (
                    <div className={styles.diaryImages}>
                      {entry.keywords.slice(0, 3).map((kw, i) => (
                        <div key={i} className={styles.diaryImage}>
                          <div style={{ width: '100%', height: '100%', background: `hsl(${(i * 60 + 30) % 360}, 20%, 90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                            {kw}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 底部互动 */}
                  {!isBurned && (
                    <div className={styles.diaryFooter}>
                      <button className={styles.diaryCommentBtn}>
                        💬 留言
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 底部快捷 ── */}
      <div className={styles.bottomNav}>
        <button className={`${styles.actionBtn} ${styles.actionBtnSecondary}`} onClick={() => navigate(`/world/${id}/permissions`)}>
          🔐 权限
        </button>
        <button className={`${styles.actionBtn} ${styles.actionBtnSecondary}`} onClick={() => navigate('/timecapsule')}>
          ⏳ 时光机
        </button>
      </div>

      {/* ── 日记全文弹框 ── */}
      {selectedEntry && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHandle} />
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>{selectedEntry.title || '日记详情'}</span>
              <button className={styles.modalClose} onClick={handleCloseModal}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {/* 日期 */}
              <div className={styles.modalDate}>
                {new Date(selectedEntry.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
                {' '}
                {new Date(selectedEntry.createdAt).toLocaleTimeString('zh-CN', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>

              {/* 情绪标签 */}
              {selectedEntry.emotion && (
                <div className={styles.modalEmotion}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: `hsl(${selectedEntry.emotionHue || 180}, 60%, 60%)` }} />
                  {selectedEntry.emotion}
                </div>
              )}

              {/* 完整正文 */}
              <div className={styles.modalContent}>
                {selectedEntry.content}
              </div>

              {/* 图片区域 */}
              {selectedEntry.keywords?.length > 0 && (
                <div className={styles.modalImages}>
                  {selectedEntry.keywords.slice(0, 4).map((kw, i) => (
                    <div key={i} className={styles.modalImage}>
                      <div style={{ width: '100%', height: 160, background: `hsl(${(i * 60 + 30) % 360}, 20%, 90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                        {kw}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
