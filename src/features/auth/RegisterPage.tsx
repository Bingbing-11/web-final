import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import styles from './RegisterPage.module.css';

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

  const handleSubmit = useCallback(async () => {
    setError('');

    if (!nickname.trim()) { setError('请输入您的昵称'); return; }
    if (!username.trim()) { setError('请输入邮箱'); return; }
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
      <div className={styles.main}>
        {/* 水晶球头部 */}
        <div className={styles.header}>
          <div className={styles.crystalWrap}>
            <div className={styles.crystalGlow} />
            <div className={styles.crystalEmoji}>🔮</div>
          </div>
          <h1 className={styles.title}>创建你的小世界</h1>
          <p className={styles.subtitle}>一个只属于你的私密空间</p>
        </div>

        {/* 表单卡片 */}
        <div className={styles.card}>
          <div className={styles.form} onKeyDown={handleKeyDown}>
            <div className={styles.field}>
              <label className={styles.label}>昵称</label>
              <input
                className={styles.input}
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="你的名字"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>邮箱</label>
              <input
                className={styles.input}
                type="email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>密码</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="至少 4 位字符"
                  autoComplete="new-password"
                />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

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

            {error && <div className={styles.error}>{error}</div>}

            <button
              className={styles.submitBtn}
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? '创建中...' : '创建账号'}
            </button>
          </div>

          <div className={styles.footer}>
            <span className={styles.footerText}>
              已有账号？<Link className={styles.footerLink} to="/login">登录</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
