import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <div className={styles.layout}>
      {/* ── Top Bar ── */}
      <header className={`${styles.topBar} ${scrolled ? styles.scrolled : ''}`}>
        <button className={styles.menuBtn} onClick={() => navigate('/settings')}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className={styles.title}>水晶球世界</h1>
        <button className={styles.searchBtn}>
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      {/* ── Page Content ── */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* ── FAB (only on home page) ── */}
      {isHome && (
        <button className={styles.fab} onClick={() => navigate('/world/create')}>
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      {/* ── Bottom Navigation ── */}
      <nav className={styles.bottomNav}>
        <NavLink to="/" end className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>home</span>
        </NavLink>
        <NavLink to="/resonance" className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>waves</span>
        </NavLink>
        <NavLink to="/friends" className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>group</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>person</span>
        </NavLink>
      </nav>
    </div>
  );
}
