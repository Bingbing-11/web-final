import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWorldStore } from '../../stores/useWorldStore';
import { useFriendStore } from '../../stores/useFriendStore';
import styles from './WorldCreate.module.css';

/* ── 数据驱动：水晶球颜色配置 ── */
const SHELL_COLORS = [
  { id: 'transparent', label: '透明', bg: 'rgba(255,255,255,0.2)',  border: 'rgba(255,255,255,0.25)', glow: 'rgba(255,255,255,0.5)'  },
  { id: 'rose',        label: '落樱', bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.3)',  glow: 'rgba(244,114,182,0.4)' },
  { id: 'skyblue',     label: '晴空', bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.3)',   glow: 'rgba(96,165,250,0.4)'  },
  { id: 'mint',        label: '薄荷', bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.3)',   glow: 'rgba(52,211,153,0.4)'  },
  { id: 'amber',       label: '琥珀', bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',   glow: 'rgba(251,191,36,0.4)'  },
] as const;

/* ── i18n 就绪：隐私提示文案 ── */
const PRIVACY_HINTS: Record<string, string> = {
  private: '仅你自己可以查看和管理其中的记忆。',
  friends: '只有被选中的好友可以访问这个世界。',
};

const MAX_NAME_LENGTH = 20;

/* ═════════════════════════════════════════════════
   WorldCreate — 创建世界
   ═════════════════════════════════════════════════ */
export default function WorldCreate() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.currentUser);
  const createWorld = useWorldStore(s => s.createWorld);
  const friends = useFriendStore(s => s.friends);
  const fetchFriends = useFriendStore(s => s.fetchFriends);

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(SHELL_COLORS[0].id);
  const [privacy, setPrivacy] = useState<'private' | 'friends'>('private');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  /* ── 初始化拉取好友列表 ── */
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  /* ── 浏览器关闭/刷新拦截 ── */
  useEffect(() => {
    const hasContent = name.trim() || selectedFriends.size > 0;
    const handler = (e: BeforeUnloadEvent) => {
      if (hasContent) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [name, selectedFriends]);

  /* ── 返回（已有内容时弹确认框） ── */
  const handleBack = useCallback(() => {
    if (name.trim() || selectedFriends.size > 0) {
      setShowBackConfirm(true);
    } else {
      navigate(-1);
    }
  }, [navigate, name, selectedFriends]);

  /* ── 水晶球选择 → 触感反馈 + 弹跳动画 ── */
  const handleColorSelect = useCallback((colorId: string) => {
    setSelectedColor(colorId);
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);

  /* ── 好友勾选/取消 ── */
  const toggleFriend = useCallback((friendId: string) => {
    setSelectedFriends(prev => {
      const next = new Set(prev);
      next.has(friendId) ? next.delete(friendId) : next.add(friendId);
      return next;
    });
  }, []);

  /* ── 完成提交 ── */
  const handleSubmit = useCallback(async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    const world = await createWorld({
      name: name.trim(),
      description: '',
      ownerId: user!.id,
      icon: '🔮',
      color: selectedColor,
      isSealed: false,
    });
    setLoading(false);
    if (world) {
      navigate(`/world/${world.id}`);
    }
  }, [name, loading, createWorld, user, selectedColor, navigate]);

  return (
    <div className={styles.page}>
      {/* ═══ 自定义顶部栏 ═══ */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack} aria-label="返回">
          <span className="material-symbols-outlined">chevron_left</span>
          <span className={styles.backLabel}>返回</span>
        </button>
        <h1 className={styles.topTitle}>创建世界</h1>
        <button
          className={`${styles.doneBtn} ${loading ? styles.doneBtnLoading : ''}`}
          onClick={handleSubmit}
          disabled={!name.trim() || loading}
        >
          {loading ? <span className={styles.spinner} /> : '完成'}
        </button>
      </header>

      {/* ═══ 主内容 ═══ */}
      <main className={styles.content}>

        {/* ── 世界名称 ── */}
        <section className={styles.section}>
          <label className={styles.label} htmlFor="world-name">给你的世界起个名字</label>
          <div className={styles.inputWrap}>
            <input
              id="world-name"
              className={styles.nameInput}
              type="text"
              placeholder="如：童年回忆、秘密花园…"
              value={name}
              onChange={e => { if (e.target.value.length <= MAX_NAME_LENGTH) setName(e.target.value); }}
              maxLength={MAX_NAME_LENGTH}
              autoFocus
            />
            <span className={`${styles.charCount} ${name.length >= MAX_NAME_LENGTH ? styles.charLimit : ''}`}>
              {name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
        </section>

        {/* ── 水晶球颜色 ── */}
        <section className={styles.section}>
          <h2 className={styles.label}>选择水晶球颜色</h2>
          <div className={styles.colorRow}>
            {SHELL_COLORS.map(c => (
              <div key={c.id} className={styles.colorItem}>
                <div
                  className={`${styles.shellOrb} ${selectedColor === c.id ? styles.shellOrbActive : ''}`}
                  style={{
                    backgroundColor: c.bg,
                    borderColor: c.border,
                    boxShadow: selectedColor === c.id ? `0 0 25px ${c.glow}` : undefined,
                  } as React.CSSProperties}
                  onClick={() => handleColorSelect(c.id)}
                  role="radio"
                  aria-checked={selectedColor === c.id}
                  aria-label={c.label}
                />
                <span className={styles.colorLabel}>{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 访问权限 ── */}
        <section className={styles.section}>
          <h2 className={styles.label}>访问权限</h2>
          <div className={styles.privacyToggle}>
            <button
              className={`${styles.privacyBtn} ${privacy === 'private' ? styles.privacyActive : ''}`}
              onClick={() => setPrivacy('private')}
            >
              私密世界
            </button>
            <button
              className={`${styles.privacyBtn} ${privacy === 'friends' ? styles.privacyActive : ''}`}
              onClick={() => setPrivacy('friends')}
            >
              指定好友可见
            </button>
          </div>
          <p className={styles.privacyHint}>{PRIVACY_HINTS[privacy]}</p>

          {/* 好友选择列表 */}
          {privacy === 'friends' && (
            <div className={styles.friendList}>
              <div className={styles.friendListTitle}>选择好友</div>
              {friends.length === 0 ? (
                <p className={styles.friendEmpty}>暂无好友，先去添加好友吧</p>
              ) : (
                <div className={styles.friendItems}>
                  {friends.map(f => {
                    const checked = selectedFriends.has(f.friendId);
                    return (
                      <div
                        key={f.id}
                        className={`${styles.friendItem} ${checked ? styles.friendSelected : ''}`}
                        onClick={() => toggleFriend(f.friendId)}
                        role="checkbox"
                        aria-checked={checked}
                      >
                        <div className={styles.friendInfo}>
                          <div className={styles.friendAvatar}>
                            {f.friendAvatar ? (
                              <img src={f.friendAvatar} alt="" />
                            ) : (
                              <span className="material-symbols-outlined">person</span>
                            )}
                          </div>
                          <span className={styles.friendName}>{f.friendName}</span>
                        </div>
                        <div className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}>
                          {checked && (
                            <span className="material-symbols-outlined" style={{ fontSize: 16, fontWeight: 700 }}>
                              check
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ═══ 返回确认弹框 ═══ */}
      {showBackConfirm && (
        <div className={styles.overlay} onClick={() => setShowBackConfirm(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetTitle}>放弃编辑？</div>
            <div className={styles.sheetDesc}>你已输入的内容将不会被保存</div>
            <div className={styles.sheetActions}>
              <button className={styles.sheetCancel} onClick={() => setShowBackConfirm(false)}>
                继续编辑
              </button>
              <button className={styles.sheetConfirm} onClick={() => navigate(-1)}>
                放弃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
