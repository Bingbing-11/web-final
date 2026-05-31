import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFriendStore } from '../../stores/useFriendStore';
import styles from './FriendList.module.css';

/* ── 好友备注（本地存储）── */
const REMARK_KEY = 'pw_friend_remarks';

function loadRemarks(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(REMARK_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveRemarks(remarks: Record<string, string>) {
  localStorage.setItem(REMARK_KEY, JSON.stringify(remarks));
}

/* ── 好友头像 Emoji 映射 ── */
const AVATAR_EMOJIS = ['🌍', '🌙', '🌊', '🌸', '🔮', '🦋', '✨', '🍃', '💎', '🎭', '🎪', '🌈'];

/* 境外不可达域名黑名单 */
const BLOCKED_HOSTS = ['googleusercontent.com', 'lh3.google', 'googleapis.com'];

function getAvatarEmoji(friendId: string): string {
  let hash = 0;
  for (let i = 0; i < friendId.length; i++) {
    hash = ((hash << 5) - hash + friendId.charCodeAt(i)) | 0;
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

/* ── 主组件 ── */
export default function FriendList() {
  const user = useAuthStore(s => s.currentUser);
  const friends = useFriendStore(s => s.getFriends(user?.id || ''));
  const pendingRequests = useFriendStore(s => s.getPendingRequests(user?.id || ''));
  const sentRequests = useFriendStore(s => s.getSentRequests(user?.id || ''));
  const { fetchFriends, fetchRequests, searchUser, sendRequest, acceptRequest, rejectRequest, removeFriend } = useFriendStore();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState<Record<string, string>>(loadRemarks);
  const [showRequests, setShowRequests] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [manageFriend, setManageFriend] = useState<string | null>(null);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [brokenAvatars, setBrokenAvatars] = useState<Set<string>>(new Set());
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 通过 Outlet context 向 MainLayout 传递顶部栏右侧按钮 */
  const outletContextValue = useMemo(() => ({
    topBarRight: (
      <button className={styles.manageBtn} onClick={() => setShowRequests(v => !v)}>
        管理
      </button>
    ),
  }), [setShowRequests]);

  /* 数据加载 */
  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [fetchFriends, fetchRequests]);

  const pendingCount = pendingRequests.length;

  /* 清理定时器 */
  useEffect(() => {
    return () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, []);

  /* 头像预检：境外/不可用图片直接跳过，显示 emoji */
  useEffect(() => {
    friends.forEach(f => {
      if (f.friendAvatar && !brokenAvatars.has(f.friendId)) {
        const isBlocked = BLOCKED_HOSTS.some(h => f.friendAvatar!.includes(h));
        if (isBlocked) {
          setBrokenAvatars(prev => {
            if (prev.has(f.friendId)) return prev;
            return new Set(prev).add(f.friendId);
          });
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends.length]);

  /* 添加好友 */
  const handleAddFriend = useCallback(async () => {
    if (!searchQuery.trim() || !user || loading) return;
    setFeedback(null);
    setLoading(true);
    try {
      const found = await searchUser(searchQuery.trim());
      if (!found) {
        setFeedback({ type: 'error', msg: '未找到该用户' });
        return;
      }
      if (found.id === user.id) {
        setFeedback({ type: 'error', msg: '不能添加自己哦' });
        return;
      }
      const ok = await sendRequest(user.id, user.nickname, found.id, found.nickname);
      if (ok) {
        setFeedback({ type: 'success', msg: '好友请求已发送' });
        setSearchQuery('');
      } else {
        setFeedback({ type: 'error', msg: '发送失败，可能已是好友或有待处理请求' });
      }
    } catch {
      setFeedback({ type: 'error', msg: '网络异常，请稍后再试' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, user, loading, searchUser, sendRequest]);

  /* 接受 / 拒绝请求 */
  const handleAccept = useCallback(
    (reqId: string) => acceptRequest(reqId),
    [acceptRequest],
  );
  const handleReject = useCallback(
    (reqId: string) => rejectRequest(reqId),
    [rejectRequest],
  );

  /* 删除好友 */
  const handleRemove = useCallback(
    (friendshipId: string) => {
      if (!user) return;
      removeFriend(friendshipId, user.id);
      setManageFriend(null);
    },
    [user, removeFriend],
  );

  /* 取消已发送请求 */
  const handleCancelSent = useCallback(
    (reqId: string) => rejectRequest(reqId),
    [rejectRequest],
  );

  /* 修改备注 */
  const handleEditRemark = useCallback(
    (friendId: string, currentName: string) => {
      const newRemark = prompt('修改备注名称', remarks[friendId] || currentName);
      if (newRemark !== null) {
        const updated = { ...remarks };
        if (newRemark.trim()) {
          updated[friendId] = newRemark.trim();
        } else {
          delete updated[friendId];
        }
        setRemarks(updated);
        saveRemarks(updated);
      }
      setManageFriend(null);
    },
    [remarks],
  );

  /* 点击水晶球：脉冲 → 跳转 */
  const handleSphereClick = useCallback((friendId: string) => {
    if (manageFriend) return;
    if (navigator.vibrate) navigator.vibrate(10);
    setPulsingId(friendId);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => {
      setPulsingId(null);
      navigate(`/world/${friendId}`);
    }, 400);
  }, [manageFriend, navigate]);

  /* 长按 → 打开管理菜单 */
  const handleTouchStart = useCallback((friendId: string) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(30);
      setManageFriend(friendId);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  /* 当前管理的好友 */
  const managingFriend = friends.find(f => f.friendId === manageFriend);

  return (
    <div className={styles.page}>
      {/* 通过 Outlet context 传递顶部栏右侧按钮 */}
      {/* Outlet 由 MainLayout 渲染，此处仅构造 context 值 */}
      {null}

      {/* ── 搜索栏 ── */}
      <section className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrap}>
            <span className={styles.searchInputIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="寻找共鸣的灵魂…"
              onKeyDown={e => e.key === 'Enter' && handleAddFriend()}
            />
          </div>
          <button
            className={styles.searchSubmit}
            disabled={loading}
            onClick={handleAddFriend}
          >
            {loading ? '…' : '添加'}
          </button>
        </div>
        {feedback && (
          <div className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
            {feedback.msg}
          </div>
        )}
      </section>

      {/* ── 好友请求（可折叠） ── */}
      {(pendingRequests.length > 0 || sentRequests.length > 0) && (
        <section className={styles.requestSection}>
          {pendingRequests.length > 0 && (
            <>
              <button
                className={styles.sectionToggle}
                onClick={() => setShowRequests(v => !v)}
              >
                <div className={styles.sectionToggleLeft}>
                  <span className={styles.sectionToggleIcon}>📨</span>
                  <span className={styles.sectionToggleTitle}>好友请求</span>
                  <span className={styles.sectionBadge}>{pendingCount}</span>
                </div>
                <span className={`${styles.sectionToggleArrow} ${showRequests ? styles.sectionToggleArrowOpen : ''}`}>▼</span>
              </button>
              {showRequests && (
                <div className={styles.requestList}>
                  {pendingRequests.map((r, i) => (
                    <div
                      key={r.id}
                      className={styles.requestItem}
                      style={{ '--delay': `${i * 0.08}s` } as React.CSSProperties}
                    >
                      <div className={styles.requestLeft}>
                        <img
                          className={styles.requestAvatar}
                          src={r.fromAvatar || ''}
                          alt={r.fromName}
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className={styles.requestInfo}>
                          <span className={styles.requestName}>{r.fromName}</span>
                          <span className={styles.requestMeta}>
                            {r.message || '申请添加你为好友'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.requestActions}>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnAccept}`}
                          onClick={() => handleAccept(r.id)}
                          title="接受"
                        >
                          <span className={styles.actionBtnIcon}>✅</span>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnReject}`}
                          onClick={() => handleReject(r.id)}
                          title="拒绝"
                        >
                          <span className={styles.actionBtnIcon}>❌</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {sentRequests.length > 0 && (
            <>
              <button
                className={styles.sectionToggle}
                onClick={() => setShowSent(v => !v)}
                style={{ marginTop: 8 }}
              >
                <div className={styles.sectionToggleLeft}>
                  <span className={styles.sectionToggleIcon}>📤</span>
                  <span className={styles.sectionToggleTitle}>已发送</span>
                  <span className={styles.sectionBadge}>{sentRequests.length}</span>
                </div>
                <span className={`${styles.sectionToggleArrow} ${showSent ? styles.sectionToggleArrowOpen : ''}`}>▼</span>
              </button>
              {showSent && (
                <div className={styles.sentList}>
                  {sentRequests.map((r, i) => (
                    <div
                      key={r.id}
                      className={styles.sentItem}
                      style={{ '--delay': `${i * 0.08}s` } as React.CSSProperties}
                    >
                      <div className={styles.sentLeft}>
                        <div className={styles.sentAvatar} />
                        <div>
                          <div className={styles.sentName}>{r.toName}</div>
                          <div className={styles.sentTime}>
                            {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>
                      <div className={styles.sentRight}>
                        <span className={styles.sentStatus}>等待中</span>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => handleCancelSent(r.id)}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── 好友水晶球网格 ── */}
      <section>
        <div className={styles.sectionLabel}>
          我的好友 · {friends.length}
        </div>

        {friends.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔮</div>
            <div>还没有好友<br />搜索 ID 或昵称来添加第一位朋友吧</div>
          </div>
        ) : (
          <div className={styles.sphereGrid}>
            {friends.map((f) => {
              const displayName = remarks[f.friendId] || f.friendName;
              const hasRemark = !!remarks[f.friendId];
              const isPulsing = pulsingId === f.friendId;

              return (
                <div
                  key={f.id}
                  className={styles.sphereItem}
                  onClick={() => handleSphereClick(f.friendId)}
                  onTouchStart={() => handleTouchStart(f.friendId)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  <div className={styles.sphereWrap}>
                    <div className={`${styles.sphere} ${isPulsing ? styles.spherePulse : ''}`}>
                      <div className={styles.sphereContent}>
                        {f.friendAvatar && !brokenAvatars.has(f.friendId) ? (
                          <img
                            className={styles.sphereAvatar}
                            src={f.friendAvatar}
                            alt={f.friendName}
                            onError={() => {
                              setBrokenAvatars(prev => new Set(prev).add(f.friendId));
                            }}
                          />
                        ) : (
                          <span className={styles.sphereEmoji}>
                            {getAvatarEmoji(f.friendId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={styles.sphereName}>{displayName}</span>
                  {hasRemark && (
                    <span className={styles.sphereRemark}>{f.friendName}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 底部装饰提示 */}
      {friends.length > 0 && (
        <div className={styles.bottomHint}>
          <p className={styles.bottomHintText}>向下滑动发现更多灵魂</p>
          <div className={styles.bottomDots}>
            <div className={styles.bottomDot} />
            <div className={`${styles.bottomDot}`} style={{ opacity: 0.6 }} />
            <div className={`${styles.bottomDot}`} style={{ opacity: 0.3 }} />
          </div>
        </div>
      )}

      {/* ── 好友管理弹窗 ── */}
      {managingFriend && (
        <div
          className={styles.manageOverlay}
          onClick={() => setManageFriend(null)}
        >
          <div
            className={styles.manageSheet}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.manageHandle} />
            <div className={styles.manageName}>
              {remarks[managingFriend.friendId] || managingFriend.friendName}
            </div>
            <div className={styles.manageActions}>
              <button
                className={styles.manageBtn}
                onClick={() => handleEditRemark(managingFriend.friendId, managingFriend.friendName)}
              >
                <span className={styles.manageBtnIcon}>✏️</span>
                <span className={styles.manageBtnLabel}>修改备注</span>
              </button>
              <button
                className={styles.manageBtn}
                onClick={() => {
                  setManageFriend(null);
                  navigate(`/world/${managingFriend.friendId}`);
                }}
              >
                <span className={styles.manageBtnIcon}>🌍</span>
                <span className={styles.manageBtnLabel}>访问世界</span>
              </button>
              <button
                className={`${styles.manageBtn} ${styles.manageBtnDanger}`}
                onClick={() => handleRemove(managingFriend.id)}
              >
                <span className={styles.manageBtnIcon}>👋</span>
                <span className={styles.manageBtnLabel}>移除好友</span>
              </button>
            </div>
            <button
              className={styles.manageClose}
              onClick={() => setManageFriend(null)}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
