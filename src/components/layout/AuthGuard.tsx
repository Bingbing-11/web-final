import { useState, useEffect } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import styles from './AuthGuard.module.css';

export default function AuthGuard() {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const isLoading = useAuthStore(s => s.isLoading);
  const checkAuth = useAuthStore(s => s.checkAuth);
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      checkAuth().finally(() => setChecked(true));
    } else {
      setChecked(true);
    }
  }, [isLoggedIn, checkAuth]);

  if (isLoading || !checked) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingText}>加载中...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
