import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import type { Entry } from '../../types/entry';
import { MOCK_TIME_DATES, MOCK_TIME_MEMORIES_MAP } from '../../mocks/mockTimeMachine';
import type { TimeMemory } from '../../mocks/mockTimeMachine';
import styles from './TimeMachine.module.css';

/* ── 正文截断行数 ── */
const PREVIEW_LINE_CLAMP = 4;

/* ── 预置日期列表 ── */
const PRESET_DATES = [
  { date: '2024-05-25', display: '2024年5月25日' },
  { date: '2024-06-01', display: '2024年6月1日' },
  { date: '2024-07-15', display: '2024年7月15日' },
];

export default function TimeMachine() {
  const navigate = useNavigate();
  const { nightMode } = useThemeStore();

  /* ── 日期状态 ── */
  const [selectedDate, setSelectedDate] = useState('2024-05-25');
  const [searchQuery, setSearchQuery] = useState('');
  const [travelToast, setTravelToast] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  /* ── 获取当前日期对应的记忆 ── */
  const currentMemories = useMemo(() => {
    const group = MOCK_TIME_MEMORIES_MAP[selectedDate];
    if (!group) return null;
    return group.memories;
  }, [selectedDate]);

  /* ── 搜索过滤 ── */
  const filteredMemories = useMemo(() => {
    if (!currentMemories) return [];
    if (!searchQuery.trim()) return currentMemories;

    const q = searchQuery.toLowerCase();
    return currentMemories.filter(m => {
      if (m.type === 'echo' || !m.entry) return false;
      return (
        m.entry.title.toLowerCase().includes(q) ||
        m.entry.content.toLowerCase().includes(q) ||
        m.entry.keywords?.some(k => k.toLowerCase().includes(q)) ||
        m.worldName.toLowerCase().includes(q)
      );
    });
  }, [currentMemories, searchQuery]);

  /* ── 穿梭按钮 ── */
  const handleTravel = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    const display = PRESET_DATES.find(d => d.date === selectedDate)?.display || selectedDate;
    setTravelToast(`穿梭到 ${display}`);
    setTimeout(() => setTravelToast(''), 2000);
  }, [selectedDate]);

  /* ── 日期选择 ── */
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
  }, []);

  /* ── 返回按钮 ── */
  const handleBack = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(8);
    navigate('/settings');
  }, [navigate]);

  /* ── 点击日记 → 打开弹框 ── */
  const handleEntryClick = useCallback((entry: Entry) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setSelectedEntry(entry);
  }, []);

  /* ── 关闭弹框 ── */
  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  /* ── 弹框时禁止背景滚动 ── */
  useEffect(() => {
    if (selectedEntry) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedEntry]);

  /* ── 交叉观察动画 ── */
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove(styles.hidden);
            entry.target.classList.add(styles.visible);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((el) => {
      el.classList.add(styles.hidden);
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [filteredMemories]);

  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  /* ── 判断正文是否需要截断 ── */
  const isContentLong = useCallback((content: string) => {
    return content.split('\n').length > PREVIEW_LINE_CLAMP || content.length > 120;
  }, []);

  /* ── 获取当前日期的显示文本 ── */
  const currentDateDisplay = useMemo(() => {
    return PRESET_DATES.find(d => d.date === selectedDate)?.display || selectedDate;
  }, [selectedDate]);

  /* ── 检查是否所有可见记忆都已渲染 ── */
  const hasEchoSlot = useMemo(() => {
    return currentMemories?.some(m => m.type === 'echo') ?? false;
  }, [currentMemories]);

  return (
    <div className={styles.page}>
      {/* 深夜模式暗角遮罩 */}
      {nightMode && <div className={styles.nightOverlay} />}

      {/* ── 顶部导航栏 ── */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className={styles.topBarTitle}>时光机</h1>
        <div className={styles.searchWrap}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input
            className={styles.searchInput}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索回忆..."
          />
        </div>
      </header>

      {/* ── 主内容 ── */}
      <div className={styles.mainContent}>
        {/* 日期穿梭选择器 */}
        <section className={styles.datePicker}>
          <div className={styles.dateCard}>
            <div className={styles.datePickerLeft}>
              <div className={styles.datePickerIcon}>
                <span className="material-symbols-outlined">event_upcoming</span>
              </div>
              <div className={styles.dateDisplay}>{currentDateDisplay}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                value={selectedDate}
                onChange={handleDateChange}
                style={{
                  fontSize: 12,
                  padding: '6px 8px',
                  borderRadius: 8,
                  border: '1px solid rgba(203,198,187,0.3)',
                  background: 'rgba(255,255,255,0.6)',
                  color: '#49473F',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {PRESET_DATES.map(d => (
                  <option key={d.date} value={d.date}>{d.display}</option>
                ))}
              </select>
              <button className={styles.travelBtn} onClick={handleTravel}>
                穿梭
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </div>
          </div>
        </section>

        {/* 时间线容器 */}
        {filteredMemories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <div className={styles.emptyText}>
              {searchQuery ? `没有找到包含「${searchQuery}」的回忆` : '这一天还没有留下记忆'}
            </div>
          </div>
        ) : (
          <div className={styles.timeline}>
            {/* 纵向时间线 */}
            <div className={styles.timelineLine} />

            {filteredMemories.map((memory, index) => (
              <TimeMemoryCard
                key={memory.id}
                memory={memory}
                isEcho={memory.type === 'echo'}
                onEntryClick={handleEntryClick}
                isContentLong={isContentLong}
                cardRef={setCardRef}
              />
            ))}
          </div>
        )}
      </div>

      {/* 穿梭成功 Toast */}
      {travelToast && (
        <div className={styles.travelToast}>{travelToast}</div>
      )}

      {/* ═══════════════ 日记全文弹框 ═══════════════ */}
      {selectedEntry && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHandle} />
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {selectedEntry.title || '日记详情'}
              </span>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <div className={styles.modalBody}>
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

              {selectedEntry.emotion && (
                <div className={styles.modalEmotion}>
                  <span
                    className={styles.emotionDot}
                    style={{ background: `hsl(${selectedEntry.emotionHue || 180}, 60%, 60%)` }}
                  />
                  {selectedEntry.emotion}
                </div>
              )}

              <div className={styles.modalContent}>
                {selectedEntry.content.split('\n').map((line, i) => (
                  <p key={i}>{line || '\u00A0'}</p>
                ))}
              </div>

              {selectedEntry.keywords?.length > 0 && (
                <div className={styles.modalImages}>
                  {selectedEntry.keywords.slice(0, 4).map((kw, i) => (
                    <div key={i} className={styles.modalImage}>
                      <div
                        style={{
                          height: 120,
                          borderRadius: 12,
                          background: `hsl(${(i * 60 + 30) % 360}, 20%, 90%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          color: '#7A776E',
                          fontFamily: 'Literata, serif',
                        }}
                      >
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

/* ═══════════════ TimeMemoryCard 子组件 ═══════════════ */
function TimeMemoryCard({
  memory,
  isEcho,
  onEntryClick,
  isContentLong,
  cardRef,
}: {
  memory: TimeMemory;
  isEcho: boolean;
  onEntryClick: (entry: Entry) => void;
  isContentLong: (content: string) => boolean;
  cardRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  const entry = memory.entry;

  /* ── 圆点样式 ── */
  const dotClass = isEcho
    ? styles.dotEcho
    : memory.yearsAgo >= 5
    ? styles.dotPrimary
    : styles.dotSecondary;

  if (isEcho || !entry) {
    return (
      <div
        ref={el => cardRef(memory.id, el)}
        className={`${styles.memoryCard} ${styles.hidden}`}
      >
        <div className={`${styles.timelineDot} ${dotClass}`} />
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{memory.label}</span>
          <div className={styles.sectionLineDashed} />
        </div>
        <div className={styles.echoCard}>
          <div className={styles.echoIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>auto_awesome</span>
          </div>
          <div className={styles.echoText}>
            正在寻找这一天的更多回忆……
          </div>
        </div>
      </div>
    );
  }

  const isLong = isContentLong(entry.content);

  return (
    <div
      ref={el => cardRef(memory.id, el)}
      className={`${styles.memoryCard} ${styles.hidden}`}
    >
      {/* 时间线圆点 */}
      <div className={`${styles.timelineDot} ${dotClass}`} />

      {/* 年代标头 */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>{memory.label}</span>
        <div className={styles.sectionLine} />
      </div>

      {/* 玻璃卡片 */}
      <div className={styles.glassCard}>
        {/* 图片区域（有图才显示） */}
        {memory.imageUrl && (
          <div className={styles.memoryImageWrap}>
            <img
              className={styles.memoryImage}
              src={memory.imageUrl}
              alt={entry.title}
            />
            <div className={styles.worldBadge}>{memory.worldName}</div>
          </div>
        )}

        {/* 卡片内容 */}
        <div className={styles.cardBody}>
          {entry.title && (
            <h3 className={styles.cardTitle}>{entry.title}</h3>
          )}

          {/* 正文（截断/全文） */}
          <div
            className={`${styles.diaryContent} ${isLong ? styles.diaryContentTruncated : ''}`}
            onClick={() => onEntryClick(entry)}
          >
            {entry.content.split('\n').map((line, i) => (
              <p key={i}>{line || '\u00A0'}</p>
            ))}
            {isLong && (
              <div className={styles.diaryExpandHint}>点击查看全文 ↓</div>
            )}
          </div>

          {/* 关键词图片占位 */}
          {entry.keywords?.length > 0 && (
            <div className={styles.keywordsRow}>
              {entry.keywords.slice(0, 3).map((kw, i) => (
                <div key={i} className={styles.keywordImage}>
                  <div
                    className={styles.keywordPlaceholder}
                    style={{
                      background: `hsl(${(i * 60 + 30) % 360}, 20%, 90%)`,
                    }}
                  >
                    {kw}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 底部操作区 */}
          <div className={styles.cardFooter}>
            <button className={styles.footerAction}>
              <span className={`material-symbols-outlined ${styles.footerActionFilled}`}>
                favorite
              </span>
            </button>
            <button className={styles.footerAction}>
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
