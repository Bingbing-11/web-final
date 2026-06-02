import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import styles from './NotificationsPage.module.css';

/* ── 通知数据类型 ── */
interface Notification {
  id: string;
  userName: string;
  quote: string;
  timestamp: string;
}

/* ── 模拟通知数据 ── */
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userName: '林深…',
    quote: '刚刚下过一场雨，空气里全是泥土的味道…',
    timestamp: '2小时前',
  },
  {
    id: '2',
    userName: '知夏…',
    quote: '怀旧的人总是想回到那个没有噪音的午后。',
    timestamp: '昨天 18:30',
  },
  {
    id: '3',
    userName: '月半…',
    quote: '在治愈的瞬间，我听见了花开的声音。',
    timestamp: '星期二',
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { nightMode } = useThemeStore();

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const [showEmpty, setShowEmpty] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  /* ── 全部已读 ── */
  const handleMarkAllRead = useCallback(() => {
    if (notifications.length === 0) return;

    // 1. 逐条退出动画
    const ids = notifications.map(n => n.id);
    const exitSet = new Set<string>();
    ids.forEach((id, i) => {
      setTimeout(() => {
        exitSet.add(id);
        setExitingIds(new Set(exitSet));
      }, i * 100);
    });

    // 2. 动画完成后切换空状态
    timerRef.current = setTimeout(() => {
      setNotifications([]);
      setExitingIds(new Set());
      setShowEmpty(true);
    }, ids.length * 100 + 500);
  }, [notifications]);

  /* ── 重新模拟通知 ── */
  const handleReset = useCallback(() => {
    setShowEmpty(false);
    setNotifications(MOCK_NOTIFICATIONS);
  }, []);

  /* ── 通知点击反馈 ── */
  const handleItemClick = useCallback((id: string) => {
    // 点击反馈，Future: 可导航到具体通知详情
    const el = document.getElementById(`notification-${id}`);
    if (el) {
      el.style.transform = 'scale(0.98)';
      setTimeout(() => { el.style.transform = ''; }, 100);
    }
  }, []);

  return (
    <div className={styles.page}>
      {/* 深夜模式暗角遮罩 */}
      {nightMode && <div className={styles.nightOverlay} />}

      {/* ── Top Bar ── */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/settings')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className={styles.title}>我的通知</h1>
        <button
          className={styles.markAllBtn}
          onClick={handleMarkAllRead}
          disabled={notifications.length === 0}
        >
          全部已读
        </button>
      </header>

      {/* ── 通知列表 ── */}
      {!showEmpty && notifications.length > 0 && (
        <div className={styles.notificationList}>
          {notifications.map((n) => (
            <div
              key={n.id}
              id={`notification-${n.id}`}
              className={`${styles.notificationItem} ${exitingIds.has(n.id) ? styles.exit : ''}`}
              onClick={() => handleItemClick(n.id)}
            >
              <div className={styles.iconWrap}>
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div className={styles.contentWrap}>
                <p className={styles.message}>
                  <strong>{n.userName}</strong> 点赞了你的故事：
                </p>
                <div className={styles.quoteBlock}>"{n.quote}"</div>
                <p className={styles.timestamp}>{n.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 空状态 ── */}
      <div className={`${styles.emptyState} ${showEmpty ? styles.visible : ''}`}>
        <div className={styles.emptyIconWrap}>
          <img
            className={styles.emptyIcon}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuADbDehOaMUvN1eTe1BCS_lXHyTD09g3GWYvZE_4m_-0Il99Ym0Gz8N4_P1y6HIPYpsK3HT6S6cUZC3Ga3a2NayqCDMf98sIes8EADpLezoIdEAEzmeypSfx_gJSyNr6yPLLR_7LNPOrCG1LNBtkOhxBpC0CRlSAqZPwsiGgCzut6U1_EIOItACftqJ5XOEy47UyLfwYrfCJURz5AWi-s9L6vVlQrn2KTLHCdxSqd1tQULG6JvDQuWjGoo0aQsdSc6JzM4vxY5MKJs"
            alt="柔软的云朵在水晶球中沉睡"
          />
        </div>
        <p className={styles.emptyText}>暂无通知</p>
        <button className={styles.resetBtn} onClick={handleReset}>
          重新模拟通知
        </button>
      </div>
    </div>
  );
}
