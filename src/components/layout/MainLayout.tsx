import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useLayoutStore } from '../../stores/useLayoutStore';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';
  const isDarkPage = ['/resonance', '/burn'].some(p => location.pathname.startsWith(p));
  /* 世界详情页 / 时光机页 / 编辑资料页：隐藏底部 Tab + 子页面顶栏 */
  const isFullscreenPage = /^\/world\/[^/]+$/.test(location.pathname) ||
    /^\/world\/[^/]+\/entry\//.test(location.pathname) ||
    location.pathname.startsWith('/timecapsule') || location.pathname.startsWith('/time') ||
    location.pathname === '/profile/edit' ||
    location.pathname === '/world/create' ||
    location.pathname === '/friends/manage' ||
    location.pathname.startsWith('/entry') ||
    location.pathname.startsWith('/burn');

  const isFriendsPage = location.pathname.startsWith('/friends');
  const toggleFriendRequests = useLayoutStore(s => s.toggleFriendRequests);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* 底部导航数据 */
  const navItems = useMemo(() => [
    { to: '/',         end: true,  icon: 'home',        label: '首页' },
    { to: '/resonance', end: false, icon: 'bubble_chart', label: '共鸣' },
    { to: '/friends',    end: false, icon: 'group',        label: '好友' },
    { to: '/settings',  end: false, icon: 'person',       label: '我的' },
  ], []);

  return (
    <div className={styles.layout}>
      {/* ── Top Bar（仅首页显示） ── */}
      {isHome && (
        <header className={`${styles.topBar} ${scrolled ? styles.scrolled : ''}`}>
          <div className={styles.topBarInner}>
            <h1 className={styles.title}>水晶球世界</h1>
            <button className={styles.addBtn} onClick={() => navigate('/world/create')}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>add</span>
            </button>
          </div>
        </header>
      )}

      {/* ── Page Content ── */}
      <main className={`${styles.main} ${!isHome ? styles.mainNoTop : ''}`}>
        <Outlet />
      </main>

      {/* ── 非首页：动态顶部栏（标题 + 右侧操作区） ── */}
      {!isHome && !isFullscreenPage && (
        <header className={styles.subTopBar}>
          <div className={styles.topBarInner}>
            <h1 className={styles.subTitle}>{getPageTitle(location.pathname)}</h1>
            {isFriendsPage && (
              <button className={styles.topBarRightBtn} onClick={toggleFriendRequests}>
                管理
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── Bottom Navigation（全屏页面隐藏） ── */}
      {!isFullscreenPage && (
      <nav className={`${styles.bottomNav} ${isDarkPage ? styles.darkNav : ''}`}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              {item.icon}
            </span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      )}
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/friends'))  return '好友';
  if (pathname.startsWith('/resonance')) return '共鸣池';
  if (pathname.startsWith('/timecapsule') || pathname.startsWith('/time')) return '时光机';
  if (pathname.startsWith('/settings')) return '我的';
  if (pathname.startsWith('/world/')) return '世界详情';
  return '';
}
