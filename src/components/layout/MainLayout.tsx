import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import styles from './MainLayout.module.css';

const TAB_ITEMS = [
  { to: '/', label: '首页', icon: 'home', end: true },
  { to: '/resonance', label: '共鸣', icon: 'bubble_chart', end: false },
  { to: '/friends', label: '好友', icon: 'group', end: false },
  { to: '/settings', label: '我的', icon: 'person', end: false },
] as const;

const ROUTE_TITLES: Record<string, string> = {
  '/': '水晶球世界',
  '/timecapsule': '时光机',
  '/friends': '好友',
  '/resonance': '共鸣池',
  '/settings': '我的',
  '/help': '帮助中心',
  '/entries': '日记',
  '/world/create': '创建世界',
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/world/') && pathname.endsWith('/settings')) return '世界设置';
  if (pathname.startsWith('/world/') && pathname.endsWith('/temple')) return '水晶殿';
  if (pathname.startsWith('/world/') && pathname.endsWith('/permissions')) return '权限管理';
  if (pathname.startsWith('/world/')) return '世界详情';
  if (pathname.startsWith('/entry/') && pathname.endsWith('/burn')) return '燃烧仪式';
  if (pathname.startsWith('/entry/')) return '条目详情';
  if (pathname.startsWith('/world/') && pathname.includes('/entry/')) return '编辑条目';
  return ROUTE_TITLES[pathname] || '';
}

const MAIN_TABS = ['/', '/resonance', '/friends', '/settings'];

export default function MainLayout() {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const isMainTab = MAIN_TABS.includes(location.pathname);
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className={styles.layout}>
      {/* 顶部标题栏 */}
      <header className={styles.topBar}>
        {!isMainTab && (
          <button className={styles.topBarBack} onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {isMainTab && <div className={styles.topBarSpacer} />}
        <h1 className={styles.topBarTitle}>{pageTitle}</h1>
        <div className={styles.topBarRight}>
          {isMainTab && location.pathname === '/' && (
            <button className={styles.topBarAction} onClick={() => navigate('/world/create')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
          {!isMainTab && <div className={styles.topBarSpacer} />}
        </div>
      </header>

      {/* 内容区域 */}
      <main className={styles.content}>
        <Outlet />
      </main>

      {/* 底部 Tab 导航 */}
      <nav className={styles.bottomTabBar}>
        {TAB_ITEMS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabActive : ''}`}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined ${styles.tabIcon}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
                >
                  {tab.icon}
                </span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
