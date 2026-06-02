import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import type { Entry } from '../../types/entry';
import {
  MOCK_TIME_MEMORIES_MAP,
  formatYearsAgo,
} from '../../mocks/mockTimeMachine';
import type { TimeMemory } from '../../mocks/mockTimeMachine';
import styles from './TimeMachine.module.css';

/* ── 正文截断行数 ── */
const PREVIEW_LINE_CLAMP = 4;

/* ── 月份列表 ── */
const MONTHS = [
  { value: 1, label: '1月' },
  { value: 2, label: '2月' },
  { value: 3, label: '3月' },
  { value: 4, label: '4月' },
  { value: 5, label: '5月' },
  { value: 6, label: '6月' },
  { value: 7, label: '7月' },
  { value: 8, label: '8月' },
  { value: 9, label: '9月' },
  { value: 10, label: '10月' },
  { value: 11, label: '11月' },
  { value: 12, label: '12月' },
];

/* ── 生成天数列表 ── */
function getDaysInMonth(month: number) {
  const days = new Date(2024, month, 0).getDate(); // 2024 是闰年不影响天数
  return Array.from({ length: days }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}日`,
  }));
}

export default function TimeMachine() {
  const navigate = useNavigate();
  const { nightMode } = useThemeStore();

  /* ── 日期状态 ── */
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [selectedDay, setSelectedDay] = useState(25);
  const [traveled, setTraveled] = useState(false); // 是否点击了"穿梭"
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  /* ── 计算 MM-DD key ── */
  const mmddKey = useMemo(() => {
    return `${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  }, [selectedMonth, selectedDay]);

  /* ── 天数列表（跟随月份变化） ── */
  const daysInMonth = useMemo(() => getDaysInMonth(selectedMonth), [selectedMonth]);

  /* ── 获取记忆（穿梭后才展示） ── */
  const currentMemories = useMemo(() => {
    if (!traveled) return null;
    const group = MOCK_TIME_MEMORIES_MAP[mmddKey];
    if (!group) return null;
    return group.memories;
  }, [mmddKey, traveled]);

  /* ── 为每条记忆计算 yearsAgo ── */
  const memoriesWithAgo = useMemo(() => {
    if (!currentMemories) return [];
    const nowDate = new Date();
    const targetMMDD = mmddKey; // "05-25"
    const targetMonth = parseInt(targetMMDD.slice(0, 2), 10);
    const targetDay = parseInt(targetMMDD.slice(3), 10);
    const currentYear = nowDate.getFullYear();

    return currentMemories
      .filter(m => m.type === 'memory' && m.entry)
      .map(m => {
        const created = new Date(m.entry!.createdAt);
        const createdYear = created.getFullYear();
        // 计算距离目标日期最近的年份差
        let yearsAgo = currentYear - createdYear;
        const thisYearTarget = new Date(currentYear, targetMonth - 1, targetDay);
        // 如果今年的目标日期还没到，减一年
        if (nowDate < thisYearTarget) {
          yearsAgo -= 1;
        }
        const label = formatYearsAgo(yearsAgo);
        return { ...m, yearsAgo, label };
      })
      .filter(m => m.yearsAgo > 0) // 只显示过去的记忆
      .sort((a, b) => b.yearsAgo - a.yearsAgo); // 旧的在前
  }, [currentMemories, mmddKey]);

  /* ── 搜索过滤 ── */
  const filteredMemories = useMemo(() => {
    if (!memoriesWithAgo.length) return memoriesWithAgo;
    if (!searchQuery.trim()) return memoriesWithAgo;

    const q = searchQuery.toLowerCase();
    return memoriesWithAgo.filter(m => {
      return (
        m.entry!.title.toLowerCase().includes(q) ||
        m.entry!.content.toLowerCase().includes(q) ||
        m.entry!.keywords?.some(k => k.toLowerCase().includes(q)) ||
        m.worldName.toLowerCase().includes(q)
      );
    });
  }, [memoriesWithAgo, searchQuery]);

  /* ── 穿梭按钮 ── */
  const handleTravel = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    setTraveled(true);
  }, []);

  /* ── 月份变化时重置天数 ── */
  const handleMonthChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value, 10);
    setSelectedMonth(month);
    const days = new Date(2024, month, 0).getDate();
    if (selectedDay > days) {
      setSelectedDay(days);
    }
    setTraveled(false);
  }, [selectedDay]);

  const handleDayChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(parseInt(e.target.value, 10));
    setTraveled(false);
  }, []);

  /* ── 返回首页 ── */
  const handleBack = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(8);
    navigate('/');
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

  /* ── 显示日期文本 ── */
  const dateDisplay = useMemo(() => {
    return `${selectedMonth}月${selectedDay}日`;
  }, [selectedMonth, selectedDay]);

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
              <div className={styles.dateDisplay}>
                {traveled ? dateDisplay : '选择日期'}
              </div>
            </div>
            <div className={styles.dateControls}>
              <select
                className={styles.dateSelect}
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                className={styles.dateSelect}
                value={selectedDay}
                onChange={handleDayChange}
              >
                {daysInMonth.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <button className={styles.travelBtn} onClick={handleTravel}>
                穿梭
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </div>
          </div>
        </section>

        {/* 记忆列表 */}
        {!traveled ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <div className={styles.emptyText}>
              选择日期，点击"穿梭"回到那天
            </div>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <div className={styles.emptyText}>
              {searchQuery
                ? `没有找到包含「${searchQuery}」的回忆`
                : `这一天还没有留下过去的记忆`}
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
                onEntryClick={handleEntryClick}
                isContentLong={isContentLong}
                cardRef={setCardRef}
              />
            ))}
          </div>
        )}
      </div>

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

              <div className={styles.modalContent}>
                {selectedEntry.content.split('\n').map((line, i) => (
                  <p key={i}>{line || '\u00A0'}</p>
                ))}
              </div>
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
  onEntryClick,
  isContentLong,
  cardRef,
}: {
  memory: TimeMemory & { yearsAgo?: number; label?: string };
  onEntryClick: (entry: Entry) => void;
  isContentLong: (content: string) => boolean;
  cardRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  const entry = memory.entry!;
  const isLong = isContentLong(entry.content);

  /* ── 圆点样式 ── */
  const dotClass = (memory.yearsAgo ?? 0) >= 5
    ? styles.dotPrimary
    : styles.dotSecondary;

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
        </div>
      </div>
    </div>
  );
}
