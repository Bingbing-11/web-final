import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWorldStore } from '../../stores/useWorldStore';
import { useEntryStore } from '../../stores/useEntryStore';
import styles from './SettingsPage.module.css';

/* ── 数字滚动动画 hook ── */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef<ReturnType<typeof requestAnimationFrame>>();

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return value;
}

/* ── 统计卡片 ── */
function StatCard({ value, label, loading }: { value: number; label: string; loading: boolean }) {
  const animated = useCountUp(loading ? 0 : value);
  return (
    <div className={styles.statCard}>
      {loading ? (
        <div className={styles.statSkeleton} />
      ) : (
        <span className={styles.statValue}>{animated}</span>
      )}
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { nightMode, toggleNightMode, nightModeStart, nightModeEnd, setNightModeSchedule } = useThemeStore();
  const { currentUser, logout, fetchStats, profileStats, statsLoading } = useAuthStore();

  /* 动态统计：回忆数 = entryStore 条目数，连续天数从 profileStats 取 */
  const entryCount = useEntryStore(s => s.entries.length);
  const memoriesCount = profileStats?.memoriesCount ?? entryCount;
  const streakDays = profileStats?.streakDays ?? 0;

  /* 首次加载获取统计 */
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ── 退出登录二次确认 ── */
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = useCallback(async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  /* ── 导出数据 ── */
  const [showExportToast, setShowExportToast] = useState(false);

  const handleExport = useCallback(() => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('pw_')) {
        try { data[key] = JSON.parse(localStorage.getItem(key) || 'null'); } catch { data[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crystal-ball-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    /* 显示导出成功 Toast */
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 2500);
  }, []);

  /* ── 深夜模式时间 ── */
  const handleStart = (val: string) => {
    const n = parseInt(val);
    if (n >= 0 && n <= 23) setNightModeSchedule(n, nightModeEnd);
  };
  const handleEnd = (val: string) => {
    const n = parseInt(val);
    if (n >= 0 && n <= 23) setNightModeSchedule(nightModeStart, n);
  };

  /* ── 菜单项导航 ── */
  const menuItems = [
    { icon: 'temple_buddhist', label: '记忆圣殿', onClick: () => navigate('/memory-sanctuary') },
    { icon: 'schedule', label: '时光机', onClick: () => navigate('/timecapsule') },
    { icon: 'notifications', label: '我的通知', onClick: () => navigate('/notifications') },
    { icon: 'auto_stories', label: '新手教程', onClick: () => {} },
    { icon: 'verified_user', label: '隐私政策', onClick: () => {} },
    { icon: 'download', label: '导出数据', onClick: handleExport },
  ];

  if (!currentUser) return null;

  return (
    <div className={styles.page}>
      {/* 深夜模式暗角遮罩 */}
      {nightMode && <div className={styles.nightOverlay} />}

      {/* 导出成功 Toast */}
      {showExportToast && (
        <div className={styles.toast}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>check_circle</span>
          数据导出成功
        </div>
      )}

      {/* ── Profile Header ── */}
      <section className={styles.profileSection}>
        <div className={styles.avatarWrap} onClick={() => navigate('/profile/edit')}>
          <div className={styles.avatarOuter}>
            {currentUser.avatar ? (
              <img className={styles.avatarImg} src={currentUser.avatar} alt={currentUser.nickname} />
            ) : (
              <div className={styles.avatarPlaceholder}>{currentUser.nickname.charAt(0)}</div>
            )}
          </div>
          <div className={styles.avatarEditBadge}>
            <span className="material-symbols-outlined">edit</span>
          </div>
        </div>
        <h2 className={styles.userName}>{currentUser.nickname}</h2>
      </section>

      {/* ── Stats Bento Grid ── */}
      <div className={styles.statsGrid}>
        <StatCard value={memoriesCount} label="回忆" loading={statsLoading} />
        <StatCard value={streakDays} label="天连续记录" loading={statsLoading} />
      </div>

      {/* ── Menu Items ── */}
      <nav className={styles.menuList}>
        {menuItems.map((item) => (
          <button key={item.label} className={styles.menuItem} onClick={item.onClick}>
            <div className={styles.menuLeft}>
              <div className={styles.menuIcon}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <span className={styles.menuLabel}>{item.label}</span>
            </div>
            <span className={`material-symbols-outlined ${styles.menuArrow}`}>chevron_right</span>
          </button>
        ))}

        {/* ── 深夜模式开关 ── */}
        <div className={styles.menuItem}>
          <div className={styles.menuLeft}>
            <div className={styles.menuIcon}>
              <span className="material-symbols-outlined">dark_mode</span>
            </div>
            <div className={styles.menuTextGroup}>
              <span className={styles.menuLabel}>深夜模式</span>
              <span className={styles.menuDesc}>定时切换为深色模式</span>
            </div>
          </div>
          <div
            className={`${styles.toggle} ${nightMode ? styles.toggleActive : ''}`}
            onClick={toggleNightMode}
          >
            <div className={styles.toggleThumb} />
          </div>
        </div>

        {/* 深夜模式时间设置 */}
        {nightMode && (
          <div className={styles.scheduleRow}>
            <span className={styles.scheduleLabel}>自动开启</span>
            <input className={styles.scheduleInput} type="number" min={0} max={23} value={nightModeStart} onChange={e => handleStart(e.target.value)} />
            <span className={styles.scheduleSep}>:00 —</span>
            <input className={styles.scheduleInput} type="number" min={0} max={23} value={nightModeEnd} onChange={e => handleEnd(e.target.value)} />
            <span className={styles.scheduleSep}>:00</span>
          </div>
        )}

        {/* ── 退出登录 ── */}
        <button className={styles.menuItemLogout} onClick={() => setShowLogoutConfirm(true)}>
          <div className={styles.menuLeft}>
            <div className={styles.menuIconLogout}>
              <span className="material-symbols-outlined">logout</span>
            </div>
            <span className={styles.menuLabelLogout}>退出登录</span>
          </div>
          <span className={`material-symbols-outlined ${styles.menuArrowLogout}`}>chevron_right</span>
        </button>
      </nav>

      {/* 版本号 */}
      <div className={styles.version}>
        版本 2.4.0 · 用心打造
      </div>

      {/* ── 退出登录确认弹框 ── */}
      {showLogoutConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.confirmSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmTitle}>确认退出登录？</div>
            <div className={styles.confirmDesc}>退出后需要重新登录才能访问数据</div>
            <div className={styles.confirmActions}>
              <button className={styles.confirmCancel} onClick={() => setShowLogoutConfirm(false)}>
                取消
              </button>
              <button className={styles.confirmOk} onClick={handleLogout}>
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
