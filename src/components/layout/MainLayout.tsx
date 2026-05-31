import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

      {/* ── Bottom Navigation ── */}
      <nav className={styles.bottomNav}>
        <NavLink to="/" end className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>home</span>
          <span className={styles.navLabel}>首页</span>
        </NavLink>
        <NavLink to="/resonance" className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>bubble_chart</span>
          <span className={styles.navLabel}>共鸣</span>
        </NavLink>
        <NavLink to="/friends" className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>group</span>
          <span className={styles.navLabel}>好友</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>person</span>
          <span className={styles.navLabel}>我的</span>
        </NavLink>
      </nav>
    </div>
  );
}
