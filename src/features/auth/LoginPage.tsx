import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import styles from './LoginPage.module.css';

/* ── 水晶球辉光视差 ── */
function useCrystalParallax(glowRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const glow = glowRef.current;
      if (!glow) return;
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      glow.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [glowRef]);
}

/* ── 主组件 ── */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();
  const glowRef = useRef<HTMLDivElement | null>(null);
  useCrystalParallax(glowRef);

  const handleSubmit = useCallback(async () => {
    setError('');

    if (!email.trim()) { setError('请输入电子邮箱'); return; }
    if (!password) { setError('请输入密码'); return; }

    setLoading(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        navigate('/');
      } else {
        setError('邮箱或密码错误');
      }
    } catch {
      setError('网络异常，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* ── 水晶球头部插图 ── */}
        <div className={styles.header}>
          <div className={styles.crystalWrap}>
            <div
              ref={(el) => { glowRef.current = el; }}
              className={styles.crystalGlow}
            />
            <img
              className={styles.crystalImg}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjXs1dHcXnE2NYtWsVcQ7tiAXFdMujDVp41UiSFFuMEKKOnD5QMHHOgiv5mUzIlpj1Jpa0kfkHdzYr5quqWUJTAgUTHGK5S8tOMZxd9zFeM4Und94sGNtNGdvFwgnh1IbgUq_uYpAGaT2y3xDn2cnHbNNvCXEO-jnttXHkf9SZ_oBnrUfZXdg9LGm45Bh1yAsX2zSsTUDWLrDJhXTLkyvrXKf7lIj28s1r3HiwyHu_vrVkdCrs4CA0ANS0eiTyEH6bkkTYeGSc_1s"
              alt="水晶球"
            />
          </div>
          <h1 className={styles.title}>欢迎回来</h1>
          <p className={styles.subtitle}>重返您的避风港。</p>
        </div>

        {/* ── 登录卡片 ── */}
        <div className={styles.card}>
          <div className={styles.form} onKeyDown={handleKeyDown}>
            {/* 电子邮箱 */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-email">电子邮箱</label>
              <input
                id="login-email"
                className={styles.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>

            {/* 密码 */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="login-password">密码</label>
                <a className={styles.forgotLink} href="#">忘记密码？</a>
              </div>
              <div className={styles.passwordWrap}>
                <input
                  id="login-password"
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  <span className={styles.iconSm}>
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && <div className={styles.error}>{error}</div>}

            {/* 登录按钮 */}
            <button
              className={styles.submitBtn}
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
            >
              <span>{loading ? '登录中…' : '登录'}</span>
              <span className={styles.iconSm}>
                ➜
              </span>
            </button>
          </div>

          {/* 分隔线 */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>或通过以下方式继续</span>
          </div>

          {/* 社交登录 */}
          <div className={styles.socialRow}>
            <button className={styles.socialBtn} type="button">
              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="#EA4335"/>
              </svg>
              <span className={styles.socialLabel}>Google</span>
            </button>
            <button className={styles.socialBtn} type="button">
              <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.96.95-2.21 1.72-3.72 1.72-1.55 0-2.38-.93-3.95-.93s-2.58.9-3.92.9c-1.64 0-3.18-1-4.08-2.6-.96-1.72-1.12-4.13-.13-5.83.65-1.12 1.83-1.83 3.12-1.83 1.3 0 2.18.8 3.18.8s1.88-.8 3.18-.8c1.07 0 2.1.52 2.85 1.33-2.6 1.4-2.18 5.2.45 6.25zM12.03 7.25c-.02-2.13 1.75-3.95 3.82-4.05.2 2.45-2.08 4.38-3.82 4.05z"/>
              </svg>
              <span className={styles.socialLabel}>Apple</span>
            </button>
          </div>
        </div>

        {/* 底部链接 */}
        <p className={styles.footer}>
          新用户？<Link className={styles.footerLink} to="/register">创建账号</Link>
        </p>
      </main>
    </div>
  );
}
