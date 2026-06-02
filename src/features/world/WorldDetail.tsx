import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWorldStore } from '../../stores/useWorldStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { matchScenes } from '../../lib/crystal/sceneEngine';
import { DEFAULT_CRYSTAL_PARAMS } from '../../lib/crystal/materialEngine';
import CrystalCanvas from '../../components/crystal/CrystalCanvas';
import type { Entry } from '../../types/entry';
import type { Comment } from '../../types/comment';
import { allMockComments } from '../../mocks/mockComments';
import styles from './WorldDetail.module.css';

/* ── 正文截断行数 ── */
const PREVIEW_LINE_CLAMP = 4;

export default function WorldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  /* 原始数据订阅（避免 selector 中创建新引用） */
  const rawWorlds = useWorldStore(s => s.worlds);
  const rawEntries = useEntryStore(s => s.entries);
  const addResonance = useResonanceStore(s => s.addResonance);
  const currentUser = useAuthStore(s => s.currentUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [flowToast, setFlowToast] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const flowToastTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [flowTarget, setFlowTarget] = useState<Entry | null>(null);
  const [flowingEntry, setFlowingEntry] = useState<Entry | null>(null);

  /* ── URL hash 定位（从首页消息跳转） ── */
  const highlightCommentId = useMemo(() => {
    const hash = location.hash; // "#comment-m1-1"
    if (!hash.startsWith('#comment-')) return null;
    return hash.slice('#comment-'.length);
  }, [location.hash]);

  /* 定位滚动 + 高亮效果 */
  useEffect(() => {
    if (!highlightCommentId) return;
    const targetComment = comments.find(c => c.id === highlightCommentId);
    if (!targetComment) return;

    /* 尝试在卡片预览区查找 */
    const el = document.getElementById(`comment-${highlightCommentId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add(styles.commentHighlight);
      const timer = setTimeout(() => el.classList.remove(styles.commentHighlight), 2500);
      return () => clearTimeout(timer);
    } else {
      /* 不在预览区 → 打开弹框再定位 */
      const targetEntry = entries.find(e => e.id === targetComment.entryId);
      if (targetEntry) {
        setSelectedEntry(targetEntry);
        setTimeout(() => {
          const modalEl = document.getElementById(`comment-${highlightCommentId}`);
          if (modalEl) {
            modalEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            modalEl.classList.add(styles.commentHighlight);
            setTimeout(() => modalEl.classList.remove(styles.commentHighlight), 2500);
          }
        }, 400);
      }
    }
  }, [highlightCommentId]);

  /* ── 留言状态 ── */
  const [comments, setComments] = useState<Comment[]>(() =>
    import.meta.env.DEV ? allMockComments : []
  );
  const [commentInput, setCommentInput] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  /* 从 worlds 中查找当前世界 */
  const world = useMemo(
    () => rawWorlds.find(w => w.id === id),
    [rawWorlds, id],
  );

  /* 过滤当前世界的日记 */
  const entries = useMemo(
    () => rawEntries.filter(e => e.worldId === id),
    [rawEntries, id],
  );

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

  /* 获取某篇日记的留言 */
  const getCommentsForEntry = useCallback((entryId: string) => {
    return comments.filter(c => c.entryId === entryId);
  }, [comments]);

  /* 发表留言 */
  const handleSubmitComment = useCallback((entryId: string) => {
    const text = commentInput.trim();
    if (!text) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      entryId,
      userId: 'mock-user',
      userName: '我',
      userAvatar: '🧑',
      content: text,
      ...(replyTo ? { replyToId: replyTo.id, replyToName: replyTo.userName } : {}),
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, newComment]);
    setCommentInput('');
    setReplyTo(null);
  }, [commentInput, replyTo]);

  /* 点击回复 */
  const handleReply = useCallback((comment: Comment) => {
    setReplyTo(comment);
    setCommentInput('');
    commentInputRef.current?.focus();
  }, []);

  /* 取消回复 */
  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
    setCommentInput('');
  }, []);

  /* 点击日记正文 → 打开弹框 */
  const handleEntryClick = useCallback((entry: Entry) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setSelectedEntry(entry);
  }, []);

  /* 关闭弹框 */
  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  /* 返回上一页 */
  const handleBack = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(8);
    navigate(-1);
  }, [navigate]);

  /* 新建日记 */
  const handleAddEntry = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    navigate(`/world/${id}/entry/new`);
  }, [navigate, id]);

  /* 编辑日记 */
  const handleEditEntry = useCallback((entryId: string) => {
    if (navigator.vibrate) navigator.vibrate(8);
    navigate(`/world/${id}/entry/${entryId}/edit`);
  }, [navigate, id]);

  /* 点击 → 确认弹框 */
  const handleFlowToResonance = useCallback((entry: Entry) => {
    if (navigator.vibrate) navigator.vibrate(12);
    setFlowTarget(entry);
  }, []);

  /* 确认 → 流入共鸣池 */
  const confirmFlowToResonance = useCallback(async () => {
    if (!flowTarget) return;
    if (navigator.vibrate) navigator.vibrate(12);
    await addResonance({
      worldId: flowTarget.worldId,
      worldName: world?.name,
      authorId: currentUser?.id || flowTarget.userId,
      authorName: currentUser?.nickname || '匿名',
      emotion: flowTarget.emotion || '',
      emotionHue: flowTarget.emotionHue || 180,
      content: flowTarget.content,
      keywords: flowTarget.keywords,
      isAnonymous: false,
    });
    setFlowTarget(null);
    setFlowingEntry(flowTarget);
    if (flowToastTimerRef.current) clearTimeout(flowToastTimerRef.current);
    flowToastTimerRef.current = setTimeout(() => setFlowingEntry(null), 2000);
  }, [flowTarget, addResonance, world, currentUser]);

  if (!world) return <div className={styles.empty}>世界不存在</div>;

  return (
    <div className={styles.page}>
      {/* ── 顶部栏：返回 + 世界名 + 添加 ── */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className={styles.topBarTitle}>{world.name}</h1>
        <button className={styles.addBtn} onClick={handleAddEntry} aria-label="写日记">
          <span className="material-symbols-outlined">add</span>
        </button>
      </header>

      {/* ── 搜索栏（移动端聚焦展开） ── */}
      <div className={`${styles.searchWrap} ${searchFocused ? styles.searchFocused : ''}`}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          ref={searchInputRef}
          className={styles.searchInput}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="搜索这个世界里的日记…"
        />
        {searchQuery && (
          <button className={styles.searchClear} onClick={() => { setSearchQuery(''); }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
      </div>

      {/* ── 世界描述 ── */}
      {world.description && (
        <div className={styles.worldDesc}>{world.description}</div>
      )}

      {/* ── 水晶球 ── */}
      <div className={styles.crystalWrap}>
        <CrystalCanvas params={{ ...DEFAULT_CRYSTAL_PARAMS }} sceneWeights={sceneWeights} isSealed={world.isSealed} />
      </div>

      {/* ── 日记时间线 ── */}
      <div className={styles.sectionTitle}>
        <span>日记</span>
        <span className={styles.sectionCount}>
          {filteredEntries.length} 篇
          {searchQuery.trim() && filteredEntries.length !== entries.length && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>
              （筛选）
            </span>
          )}
        </span>
      </div>

      {filteredEntries.length === 0 ? (
        searchQuery ? (
          <div className={styles.searchEmpty}>
            <div className={styles.emptyIcon}>🔍</div>
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
          {filteredEntries.map((entry) => {
            const isBurned = entry.status === 'burned';
            const isLong = entry.content.split('\n').length > PREVIEW_LINE_CLAMP || entry.content.length > 120;
            const entryComments = getCommentsForEntry(entry.id);

            return (
              <article key={entry.id} className={styles.diaryCard}>
                {/* 时间线圆点 */}
                <div className={`${styles.diaryDot} ${isBurned ? styles.diaryDotBurned : ''}`} />

                {/* 日期时间 */}
                <div className={styles.diaryTime}>
                  <span>{new Date(entry.createdAt).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
                  <span className={styles.timeDot} />
                  <span>{new Date(entry.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* 卡片主体 */}
                <div
                  className={`${styles.diaryBody} ${isBurned ? styles.diaryBodyFaded : ''}`}
                >
                  {isBurned ? (
                    /* 封存态 */
                    <div className={styles.diaryBodyFadedInner}>
                      <span className={styles.diaryContentFaded}>
                        「这一页已经随着时间变得模糊……」
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* 正文（截断） */}
                      <div
                        className={`${styles.diaryContent} ${isLong ? styles.diaryContentTruncated : ''}`}
                        onClick={() => handleEntryClick(entry)}
                      >
                        {entry.content.split('\n').map((line, i) => (
                          <p key={i}>{line || '\u00A0'}</p>
                        ))}
                        {isLong && (
                          <div className={styles.diaryExpandHint}>点击查看全文 ↓</div>
                        )}
                      </div>

                      {/* ── 留言区域 ── */}
                      <div className={styles.diaryFooter}>
                        {/* 留言列表（预览最近 2 条） */}
                        {entryComments.length > 0 && (
                          <div className={styles.commentList}>
                            {entryComments.slice(0, 2).map(c => (
                              <div key={c.id} id={`comment-${c.id}`} className={styles.commentItem}>
                                <span className={styles.commentAvatar}>{c.userAvatar}</span>
                                <div className={styles.commentBody}>
                                  <span className={styles.commentName}>{c.userName}</span>
                                  {c.replyToName && (
                                    <span className={styles.commentReplyTag}>回复 {c.replyToName}</span>
                                  )}
                                  <span className={styles.commentText}>{c.content}</span>
                                </div>
                              </div>
                            ))}
                            {entryComments.length > 2 && (
                              <button
                                className={styles.commentMoreBtn}
                                onClick={() => handleEntryClick(entry)}
                              >
                                查看全部 {entryComments.length} 条留言
                              </button>
                            )}
                          </div>
                        )}

                        {/* 留言按钮 + 数量 */}
                        <div className={styles.commentActions}>
                          <button
                            className={styles.diaryCommentBtn}
                            onClick={() => handleEntryClick(entry)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>chat_bubble</span>
                            {entryComments.length > 0 ? entryComments.length : '留言'}
                          </button>
                        </div>

                        {/* ── 操作按钮组：编辑 + 流入共鸣池 ── */}
                        <div className={styles.diaryActions}>
                          <button
                            className={styles.diaryActionBtn}
                            onClick={() => handleEditEntry(entry.id)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
                            编辑
                          </button>
                          <button
                            className={styles.diaryActionBtn}
                            onClick={() => handleFlowToResonance(entry)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>stream</span>
                            流入共鸣池
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── 流入共鸣池提示 ── */}
      {flowToast && (
        <div className={styles.flowToast}>{flowToast}</div>
      )}

      {/* ── 底部安全区占位 ── */}
      <div className={styles.bottomSpacer} />

      {/* ═══════════════ 日记全文弹框（含完整留言） ═══════════════ */}
      {selectedEntry && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            {/* 拖拽柄 */}
            <div className={styles.modalHandle} />

            {/* 弹框头部 */}
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>{selectedEntry.title || '日记详情'}</span>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {/* 弹框内容 */}
            <div className={styles.modalBody}>
              {/* 日期 */}
              <div className={styles.modalDate}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>event</span>
                {new Date(selectedEntry.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
                {' · '}
                {new Date(selectedEntry.createdAt).toLocaleTimeString('zh-CN', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>

              {/* 情绪标签 */}
              {selectedEntry.emotion && (
                <div className={styles.modalEmotion}>
                  <span
                    className={styles.emotionDot}
                    style={{ background: `hsl(${selectedEntry.emotionHue || 180}, 60%, 60%)` }}
                  />
                  {selectedEntry.emotion}
                </div>
              )}

              {/* 完整正文（带横线纸风格） */}
              <div className={styles.modalContent}>
                {selectedEntry.content.split('\n').map((line, i) => (
                  <p key={i} className={styles.modalPara}>{line || '\u00A0'}</p>
                ))}
              </div>

              {/* ══ 弹框内完整留言区 ══ */}
              <div className={styles.modalComments}>
                <div className={styles.modalCommentsTitle}>
                  留言 ({getCommentsForEntry(selectedEntry.id).length})
                </div>

                {getCommentsForEntry(selectedEntry.id).length === 0 ? (
                  <div className={styles.modalCommentsEmpty}>
                    还没有留言，说点什么吧 ✨
                  </div>
                ) : (
                  <div className={styles.modalCommentList}>
                    {getCommentsForEntry(selectedEntry.id).map(c => (
                      <div key={c.id} id={`comment-${c.id}`} className={styles.modalCommentItem}>
                        <span className={styles.commentAvatar}>{c.userAvatar}</span>
                        <div className={styles.commentBody}>
                          <div className={styles.commentHeader}>
                            <span className={styles.commentName}>{c.userName}</span>
                            <span className={styles.commentTime}>
                              {new Date(c.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {c.replyToName && (
                            <div className={styles.commentReplyRef}>
                              回复 <span>{c.replyToName}</span>
                            </div>
                          )}
                          <p className={styles.commentText}>{c.content}</p>
                          <button
                            className={styles.commentReplyBtn}
                            onClick={() => handleReply(c)}
                          >
                            回复
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 留言输入框 */}
                <div className={styles.commentInputWrap}>
                  {replyTo && (
                    <div className={styles.replyHint}>
                      <span>回复 {replyTo.userName}</span>
                      <button className={styles.replyCancel} onClick={handleCancelReply}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                      </button>
                    </div>
                  )}
                  <div className={styles.commentInputRow}>
                    <span className={styles.commentInputAvatar}>🧑</span>
                    <input
                      ref={commentInputRef}
                      className={styles.commentInput}
                      type="text"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      placeholder={replyTo ? `回复 ${replyTo.userName}…` : '写下留言…'}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          handleSubmitComment(selectedEntry.id);
                        }
                      }}
                    />
                    <button
                      className={styles.commentSendBtn}
                      onClick={() => handleSubmitComment(selectedEntry.id)}
                      disabled={!commentInput.trim()}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ 底部安全区 ═══════════════ */}
    </div>
  );
}
