import { NavLink, Outlet, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import styles from './MainLayout.module.css';

interface TopBarContext {
  topBarRight?: React.ReactNode;
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';
  const isDarkPage = ['/resonance', '/burn'].some(p => location.pathname.startsWith(p));

  /* 从 Outlet context 读取顶部栏右侧内容 */
  const outletContext = useOutletContext() as TopBarContext | null;
  const topBarRight = outletContext?.topBarRight ?? null;

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

      {/* ── Page Content（通过 context 传递 topBarRight） ── */}
      <main className={`${styles.main} ${!isHome ? styles.mainNoTop : ''}`}>
        <Outlet context={{ topBarRight } satisfies TopBarContext} />
      </main>

      {/* ── 非首页：动态顶部栏（标题 + 右侧操作区） ── */}
      {!isHome && (
        <header className={styles.subTopBar}>
          <div className={styles.topBarInner}>
            <h1 className={styles.subTitle}>{getPageTitle(location.pathname)}</h1>
            {topBarRight && <div className={styles.topBarRight}>{topBarRight}</div>}
          </div>
        </header>
      )}

      {/* ── Bottom Navigation ── */}
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
