import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFriendStore } from '../../stores/useFriendStore';
import { useLayoutStore } from '../../stores/useLayoutStore';
import { mockFriendWorlds } from '../../mocks/mockWorlds';
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
const AVATAR_EMOJIS = ['🔮', '🌙', '🌊', '🌸', '✨', '🦋', '💎', '🍃', '🎭', '🌈', '🎪', '🐾'];

/* 每个水晶球不同颜色的光晕 */
const GLOW_COLORS = [
  'rgba(215, 186, 255, 0.35)',   // 紫
  'rgba(255, 184, 108, 0.35)',   // 橙
  'rgba(80, 250, 123, 0.30)',    // 绿
  'rgba(255, 121, 198, 0.30)',    // 粉
  'rgba(139, 233, 253, 0.30)',   // 青
  'rgba(241, 250, 140, 0.30)',   // 黄
];

/* 境外不可达域名黑名单 */
const BLOCKED_HOSTS = ['googleusercontent.com', 'lh3.google', 'googleapis.com'];

function getAvatarEmoji(friendId: string): string {
  let hash = 0;
  for (let i = 0; i < friendId.length; i++) {
    hash = ((hash << 5) - hash + friendId.charCodeAt(i)) | 0;
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

function getGlowColor(index: number): string {
  return GLOW_COLORS[index % GLOW_COLORS.length];
}

/** 根据 friendId 查找对应的 mockWorld imageUrl */
function getFriendImageUrl(friendId: string): string | undefined {
  const world = mockFriendWorlds.find(w => w.ownerId === friendId);
  return world?.imageUrl;
}

/* ── 主组件 ── */
export default function FriendList() {
  const user = useAuthStore(s => s.currentUser);
  const allFriends = useFriendStore(s => s.friends);
  const allPending = useFriendStore(s => s.pendingRequests);
  const allSent = useFriendStore(s => s.sentRequests);
  const { fetchFriends, fetchRequests, searchUser, sendRequest, acceptRequest, rejectRequest, removeFriend } = useFriendStore();

  const currentUserId = user?.id || '';
  const friends = useMemo(
    () => allFriends.filter(f => f.userId === currentUserId || f.userId === ''),
    [allFriends, currentUserId],
  );
  const pendingRequests = useMemo(() => allPending.filter(r => r.toId === currentUserId), [allPending, currentUserId]);
  const sentRequests = useMemo(() => allSent.filter(r => r.fromId === currentUserId), [allSent, currentUserId]);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState<Record<string, string>>(loadRemarks);

  /* 实时搜索筛选 */
  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(f => {
      const name = (remarks[f.friendId] || f.friendName).toLowerCase();
      const world = (f as any).latestWorldName?.toLowerCase() || '';
      return name.includes(q) || world.includes(q);
    });
  }, [friends, searchQuery, remarks]);

  const showRequests = useLayoutStore(s => s.showFriendRequests);
  const toggleShowRequests = useLayoutStore(s => s.toggleFriendRequests);
  const [showSent, setShowSent] = useState(false);
  const [manageFriend, setManageFriend] = useState<string | null>(null);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [brokenAvatars, setBrokenAvatars] = useState<Set<string>>(new Set());
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── 星空粒子背景 ── */
  const starFieldRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = starFieldRef.current;
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      star.className = styles.star!;
      const size = Math.random() * 2;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(star);
    }
  }, []);

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

  /* 头像预检：境外/不可用图片直接跳过 */
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

  /* 点击水晶球：脉冲 -> 跳转到好友世界详情 */
  const handleSphereClick = useCallback((friendId: string) => {
    if (manageFriend) return;
    if (navigator.vibrate) navigator.vibrate(10);
    const f = friends.find(fr => fr.friendId === friendId);
    const worldId = f?.sharedWorlds?.[0];
    if (!worldId) return;
    setPulsingId(friendId);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => {
      setPulsingId(null);
      navigate(`/friend/${friendId}/world/${worldId}`);
    }, 400);
  }, [manageFriend, navigate, friends]);

  /* 长按 -> 打开管理菜单 */
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

  /* 瀑布流：将好友分成左右两列 */
  const leftCol = filteredFriends.filter((_, i) => i % 2 === 0);
  const rightCol = filteredFriends.filter((_, i) => i % 2 === 1);

  /* 渲染单个水晶球 */
  const renderSphere = (f: typeof filteredFriends[0], globalIdx: number) => {
    const displayName = remarks[f.friendId] || f.friendName;
    const hasRemark = !!remarks[f.friendId];
    const isPulsing = pulsingId === f.friendId;
    const hasUpdate = (f as any).hasUpdate;
    const worldName = (f as any).latestWorldName;
    const worldImageUrl = getFriendImageUrl(f.friendId);
    const hasValidAvatar = f.friendAvatar && !brokenAvatars.has(f.friendId);
    const sphereImageUrl = hasValidAvatar ? f.friendAvatar : worldImageUrl;

    return (
      <div
        key={f.id}
        className={`${styles.sphereItem} ${hasUpdate ? styles.sphereItemHasUpdate : ''}`}
        style={{ animationDelay: `${globalIdx * 0.1}s` } as React.CSSProperties}
        onClick={() => handleSphereClick(f.friendId)}
        onTouchStart={() => handleTouchStart(f.friendId)}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className={styles.crystalBallContainer}>
          {/* 外发光 */}
          <div
            className={styles.glowAura}
            style={{ background: getGlowColor(globalIdx) }}
          />
          {/* 光环脉冲 */}
          {hasUpdate && <div className={styles.sphereHalo} />}
          {/* 通知小圆点 */}
          {hasUpdate && <div className={styles.notificationDot} />}
          {/* 水晶球主体 */}
          <div className={`${styles.crystalSphere} ${isPulsing ? styles.crystalSpherePulse : ''}`}>
            {sphereImageUrl ? (
              <img
                className={styles.crystalSphereImg}
                src={sphereImageUrl}
                alt={f.friendName}
                onError={() => {
                  setBrokenAvatars(prev => new Set(prev).add(f.friendId));
                }}
              />
            ) : (
              <div className={styles.crystalSphereEmoji}>
                {getAvatarEmoji(f.friendId)}
              </div>
            )}
          </div>
          {/* "有更新" 标签 */}
          {hasUpdate && (
            <div className={styles.updateBadge}>
              <span className={styles.updateBadgeText}>有更新</span>
            </div>
          )}
        </div>
        {/* 底座：名字 + 副标题 */}
        <div className={styles.ballBase}>
          <span className={styles.ballBaseName}>{displayName}</span>
          {worldName && <span className={styles.ballBaseSub}>{worldName}</span>}
          {hasRemark && !worldName && <span className={styles.ballBaseSub}>{f.friendName}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      {/* ── 星空背景 ── */}
      <div ref={starFieldRef} className={styles.starField} />

      {/* ── 主内容区 ── */}
      <div className={styles.scrollContainer}>
        {/* ── 头部 ── */}
        <header className={styles.header}>
          <h1 className={styles.title}>好友领域</h1>
          <button
            className={styles.headerBtn}
            onClick={() => navigate('/friends/manage')}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </header>

        {/* ── 搜索栏 ── */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchInputIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
              </span>
              <input
                className={styles.searchInput}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="寻找共鸣的灵魂..."
                onKeyDown={e => e.key === 'Enter' && handleAddFriend()}
              />
            </div>
            <button
              className={styles.searchSubmit}
              onClick={handleAddFriend}
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? '...' : '添加'}
            </button>
          </div>
          {feedback && (
            <div className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
              {feedback.msg}
            </div>
          )}
        </div>

        {/* ── 好友请求（可折叠） ── */}
        {(pendingRequests.length > 0 || sentRequests.length > 0) && (
          <section className={styles.requestSection}>
            {pendingRequests.length > 0 && (
              <>
                <button
                  className={styles.sectionToggle}
                  onClick={toggleShowRequests}
                >
                  <div className={styles.sectionToggleLeft}>
                    <span className={styles.sectionToggleIcon}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>mail</span>
                    </span>
                    <span className={styles.sectionToggleTitle}>好友请求</span>
                    <span className={styles.sectionBadge}>{pendingCount}</span>
                  </div>
                  <span className={`${styles.sectionToggleArrow} ${showRequests ? styles.sectionToggleArrowOpen : ''}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
                  </span>
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
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnReject}`}
                            onClick={() => handleReject(r.id)}
                            title="拒绝"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
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
                    <span className={styles.sectionToggleIcon}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                    </span>
                    <span className={styles.sectionToggleTitle}>已发送</span>
                    <span className={styles.sectionBadge}>{sentRequests.length}</span>
                  </div>
                  <span className={`${styles.sectionToggleArrow} ${showSent ? styles.sectionToggleArrowOpen : ''}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
                  </span>
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

        {/* ── 瀑布流水晶球 ── */}
        <section>
          <div className={styles.sectionLabel}>
            我的好友 · {friends.length}
            {searchQuery.trim() && filteredFriends.length !== friends.length && (
              <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginLeft: 6 }}>
                筛选出 {filteredFriends.length} 位
              </span>
            )}
          </div>

          {filteredFriends.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyCrystal}>🔮</div>
              <div className={styles.emptyTitle}>
                {friends.length === 0 ? '还没有好友' : '未找到匹配的好友'}
              </div>
              <div className={styles.emptyHint}>
                {friends.length === 0
                  ? '搜索 ID 或昵称来添加第一位朋友吧'
                  : '试试其他关键词'}
              </div>
            </div>
          ) : (
            <div className={styles.waterfall}>
              {/* 左列 */}
              <div className={styles.waterfallCol}>
                {leftCol.map((f, i) => renderSphere(f, i * 2))}
              </div>
              {/* 右列（下移错落） */}
              <div className={`${styles.waterfallCol} ${styles.waterfallColRight}`}>
                {rightCol.map((f, i) => renderSphere(f, i * 2 + 1))}
              </div>
            </div>
          )}
        </section>

        {/* 底部留白 */}
        <div className={styles.bottomSpacer} />
      </div>

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
                <span className={styles.manageBtnIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                </span>
                <span className={styles.manageBtnLabel}>修改备注</span>
              </button>
              <button
                className={styles.manageBtn}
                onClick={() => {
                  const worldId = managingFriend?.sharedWorlds?.[0];
                  setManageFriend(null);
                  if (worldId) {
                    navigate(`/friend/${managingFriend.friendId}/world/${worldId}`);
                  }
                }}
              >
                <span className={styles.manageBtnIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>travel_explore</span>
                </span>
                <span className={styles.manageBtnLabel}>访问世界</span>
              </button>
              <button
                className={`${styles.manageBtn} ${styles.manageBtnDanger}`}
                onClick={() => handleRemove(managingFriend.id)}
              >
                <span className={styles.manageBtnIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_remove</span>
                </span>
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
