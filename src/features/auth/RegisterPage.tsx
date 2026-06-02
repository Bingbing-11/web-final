import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import styles from './RegisterPage.module.css';

/* ── 悬浮粒子 ── */
function useFloatingParticles(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const count = 15;
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 4 + 2;
      Object.assign(p.style, {
        width: `${size}px`,
        height: `${size}px`,
        background: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: `${Math.random() * 0.3}`,
        filter: 'blur(1px)',
      });
      p.animate(
        [
          { transform: 'translate(0, 0)', opacity: 0 },
          {
            transform: `translate(${Math.random() * 100 - 50}px, ${-Math.random() * 200}px)`,
            opacity: 0.4,
            offset: 0.5,
          },
          {
            transform: `translate(${Math.random() * 200 - 100}px, ${-Math.random() * 400}px)`,
            opacity: 0,
          },
        ],
        {
          duration: 10000 + Math.random() * 20000,
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: Math.random() * -20000,
        },
      );
      container.appendChild(p);
      particles.push(p);
    }
    return () => { particles.forEach(p => p.remove()); };
  }, [containerRef]);
}

/* ── 鼠标视差 ── */
function useMouseParallax(refs: React.RefObject<HTMLDivElement | null>[]) {
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.pageX) / 50;
      const y = (window.innerHeight / 2 - e.pageY) / 50;
      refs.forEach((r, i) => {
        const el = r.current;
        if (!el) return;
        const speed = (i + 1) * 0.2;
        el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [refs]);
}

/* ── 主组件 ── */
export default function RegisterPage() {
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const register = useAuthStore(s => s.register);
  const navigate = useNavigate();

  const particleRef = useRef<HTMLDivElement | null>(null);
  const blob1Ref = useRef<HTMLDivElement | null>(null);
  const blob2Ref = useRef<HTMLDivElement | null>(null);

  useFloatingParticles(particleRef);
  useMouseParallax([blob1Ref, blob2Ref]);

  const handleSubmit = useCallback(async () => {
    setError('');

    if (!nickname.trim()) { setError('请输入您的全名'); return; }
    if (!username.trim()) { setError('请输入电子邮箱'); return; }
    if (!password) { setError('请创建密码'); return; }
    if (password.length < 4) { setError('密码至少需要 4 位字符'); return; }
    if (!terms) { setError('请同意服务条款和隐私政策'); return; }

    setLoading(true);
    try {
      const result = await register(username.trim(), nickname.trim(), password);
      if (result.ok) {
        navigate('/');
      } else {
        setError(result.message || '该邮箱已被注册，请尝试其他邮箱');
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('fetch') || msg.includes('网络') || msg.includes('Failed')) {
        setError('无法连接到服务器，请确认后端服务已启动 (localhost:3000)');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [nickname, username, password, terms, register, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

  return (
    <div className={styles.page}>
      {/* ── 大气背景 ── */}
      <div className={styles.atmosphere}>
        <div ref={blob1Ref} className={styles.blob1} />
        <div ref={blob2Ref} className={styles.blob2} />
        <div className={styles.seedWrap}>
          <img
            className={styles.seedImg}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-3fxbI5IQx598JUcQVDZQx0GvvIx-dypNwgmdKeDolfXqytQb2Mfewgh7GvOnO6unjyNLTlFIe4gnLqwCM61kuJf3U780QOSkN9OMY3lVrFY41JRIYCXPEBBT5Cmw4FG8-TWNnSvvojZJO1P1PBvWC0Poc69723DkVpJYybhWCy7TiidwbgleT0ry6Z-HRJJAWkvg-TcU_9Ctk_8lZxubhnUII6xtHCPQ__AwMiPFl99-1zsu7gCKCBaoFVsYwbUtu9VC6iM4uoo"
            alt=""
          />
        </div>
      </div>

      {/* ── 顶部品牌栏 ── */}
      <header className={styles.topBar}>
        <span className={styles.barIcon}>spa</span>
        <span className={styles.barTitle}>Ethereal Sanctuary</span>
      </header>

      {/* ── 注册面板 ── */}
      <main className={styles.main}>
        <div className={styles.card}>
          {/* 头部文案 */}
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>开启您的旅程</h1>
            <p className={styles.subtitle}>步入静谧与回忆的空间</p>
          </div>

          {/* 表单 */}
          <form className={styles.form} onKeyDown={handleKeyDown}>
            {/* 全名 */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-name">全名</label>
              <input
                id="reg-name"
                className={styles.input}
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Elara Vance"
              />
            </div>

            {/* 电子邮箱 */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-email">电子邮箱</label>
              <input
                id="reg-email"
                className={styles.input}
                type="email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="elara@sanctuary.com"
                autoComplete="email"
              />
            </div>

            {/* 密码 */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-password">创建密码</label>
              <div className={styles.passwordWrap}>
                <input
                  id="reg-password"
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  className={styles.passToggle}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  <span className={styles.matIcon}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* 条款 */}
            <div className={styles.termsRow}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                id="reg-terms"
              />
              <label className={styles.termsLabel} htmlFor="reg-terms">
                我同意 <a className={styles.termsLink} href="#" onClick={e => e.preventDefault()}>服务条款</a> 和 <a className={styles.termsLink} href="#" onClick={e => e.preventDefault()}>隐私政策</a>
              </label>
            </div>

            {/* 错误提示 */}
            {error && <div className={styles.error}>{error}</div>}

            {/* 提交按钮 */}
            <button
              className={styles.submitBtn}
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? '创建中...' : '创建账号'}
            </button>
          </form>

          {/* 底部链接 */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              已有账号？<Link className={styles.footerLink} to="/login">登录</Link>
            </p>
          </div>
        </div>
      </main>

      {/* ── 浮动粒子层 ── */}
      <div ref={particleRef} className={styles.particles} />
    </div>
  );
}
