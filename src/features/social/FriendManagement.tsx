import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFriendStore } from '../../stores/useFriendStore';
import styles from './FriendManagement.module.css';

/* ── 好友头像 Emoji 映射 ── */
const AVATAR_EMOJIS = ['🌍', '🌙', '🌊', '🌸', '🔮', '🦋', '✨', '🍃', '💎', '🎭', '🎪', '🌈'];

function getAvatarEmoji(friendId: string): string {
  let hash = 0;
  for (let i = 0; i < friendId.length; i++) {
    hash = ((hash << 5) - hash + friendId.charCodeAt(i)) | 0;
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

export default function FriendManagement() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.currentUser);
  const {
    friends,
    pendingRequests,
    fetchFriends,
    fetchRequests,
    searchUser,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  } = useFriendStore();

  const currentUserId = user?.id || '';
  const myPending = useMemo(
    () => pendingRequests.filter(r => r.toId === currentUserId),
    [pendingRequests, currentUserId],
  );

  /* 搜索状态 */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 好友管理状态 */
  const [menuFriend, setMenuFriend] = useState<string | null>(null);
  const [editingRemark, setEditingRemark] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'remove' | 'reject';
    friendId?: string;
    friendshipId?: string;
    requestId?: string;
    name: string;
  } | null>(null);

  /* 消失动画状态 */
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  /* 数据加载 */
  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [fetchFriends, fetchRequests]);

  /* 实时搜索 */
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    setSearchFeedback(null);
    setSearchResults(null);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!value.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const result = await searchUser(value.trim());
        setSearchResults(result ? [result] : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [searchUser]);

  /* 发送好友请求 */
  const handleAddFriend = useCallback(async (targetId: string, targetName: string) => {
    if (!user) return;
    setSearchFeedback(null);
    try {
      const ok = await sendRequest(user.id, user.nickname, targetId, targetName);
      if (ok) {
        setSearchFeedback({ type: 'success', msg: `已向 ${targetName} 发送好友请求` });
        setSearchQuery('');
        setSearchResults(null);
      } else {
        setSearchFeedback({ type: 'error', msg: '发送失败，可能已是好友或已有待处理请求' });
      }
    } catch {
      setSearchFeedback({ type: 'error', msg: '网络异常，请稍后再试' });
    }
  }, [user, sendRequest]);

  /* 接受请求（带消失动画） */
  const handleAccept = useCallback(async (reqId: string, requestName: string) => {
    setRemovingItems(prev => new Set(prev).add(reqId));
    await new Promise(r => setTimeout(r, 350));
    await acceptRequest(reqId);
    setRemovingItems(prev => {
      const next = new Set(prev);
      next.delete(reqId);
      return next;
    });
  }, [acceptRequest]);

  /* 拒绝请求（带消失动画） */
  const handleRejectConfirm = useCallback(async () => {
    if (!confirmAction || confirmAction.type !== 'reject' || !confirmAction.requestId) return;
    const reqId = confirmAction.requestId;
    setRemovingItems(prev => new Set(prev).add(reqId));
    await new Promise(r => setTimeout(r, 350));
    await rejectRequest(reqId);
    setRemovingItems(prev => {
      const next = new Set(prev);
      next.delete(reqId);
      return next;
    });
    setConfirmAction(null);
  }, [confirmAction, rejectRequest]);

  /* 移除好友（带消失动画） */
  const handleRemoveConfirm = useCallback(async () => {
    if (!confirmAction || confirmAction.type !== 'remove' || !confirmAction.friendshipId) return;
    const fid = confirmAction.friendshipId;
    setRemovingItems(prev => new Set(prev).add(fid));
    await new Promise(r => setTimeout(r, 350));
    await removeFriend(fid, currentUserId);
    setRemovingItems(prev => {
      const next = new Set(prev);
      next.delete(fid);
      return next;
    });
    setConfirmAction(null);
    setMenuFriend(null);
  }, [confirmAction, removeFriend, currentUserId]);

  /* 提交备注编辑 */
  const handleRemarkSubmit = useCallback((friendId: string) => {
    if (remarkInput.trim()) {
      try {
        const key = `pw_friend_remarks`;
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        existing[friendId] = remarkInput.trim();
        localStorage.setItem(key, JSON.stringify(existing));
      } catch { /* ignore */ }
    } else {
      try {
        const key = `pw_friend_remarks`;
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        delete existing[friendId];
        localStorage.setItem(key, JSON.stringify(existing));
      } catch { /* ignore */ }
    }
    setEditingRemark(null);
    setRemarkInput('');
  }, [remarkInput]);

  /* 获取备注 */
  const getRemark = useCallback((friendId: string): string | null => {
    try {
      const existing = JSON.parse(localStorage.getItem('pw_friend_remarks') || '{}');
      return existing[friendId] || null;
    } catch {
      return null;
    }
  }, []);

  return (
    <div className={styles.page}>
      {/* ── TopAppBar ── */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className={styles.topTitle}>好友管理</h1>
      </header>

      <main className={styles.content}>
        {/* ── 搜索与添加 ── */}
        <section className={styles.searchSection}>
          <div className={styles.searchCard}>
            <div className={styles.searchInputWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#666666' }}>person_add</span>
              <input
                className={styles.searchInput}
                type="text"
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                placeholder="搜索 ID / 昵称添加好友"
              />
            </div>
            <button
              className={styles.searchBtn}
              onClick={() => searchQuery.trim() && handleSearchInput(searchQuery.trim())}
              disabled={!searchQuery.trim()}
            >
              搜索
            </button>
          </div>

          {/* 搜索结果 */}
          {searching && (
            <div className={styles.searchResultItem}>
              <span className={styles.searchResultText}>搜索中...</span>
            </div>
          )}
          {searchResults !== null && !searching && (
            <div className={styles.searchResultItem}>
              {searchResults.length > 0 ? (
                <div className={styles.searchResultRow}>
                  <div className={styles.searchResultAvatar}>
                    {getAvatarEmoji(searchResults[0].id)}
                  </div>
                  <div className={styles.searchResultInfo}>
                    <div className={styles.searchResultName}>{searchResults[0].nickname}</div>
                    <div className={styles.searchResultMeta}>@{searchResults[0].username}</div>
                  </div>
                  <button
                    className={styles.addFriendBtn}
                    onClick={() => handleAddFriend(searchResults[0].id, searchResults[0].nickname)}
                  >
                    添加
                  </button>
                </div>
              ) : (
                <span className={styles.searchResultText}>未找到匹配的用户</span>
              )}
            </div>
          )}
          {searchFeedback && (
            <div className={`${styles.searchFeedback} ${searchFeedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
              {searchFeedback.msg}
            </div>
          )}
        </section>

        {/* ── 好友请求 ── */}
        {myPending.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <h2 className={styles.sectionTitle}>好友请求</h2>
                <span className={styles.sectionBadge}>{myPending.length}</span>
              </div>
            </div>
            <div className={styles.requestList}>
              {myPending.map((r) => {
                const isRemoving = removingItems.has(r.id);
                return (
                  <div
                    key={r.id}
                    className={`${styles.requestCard} ${isRemoving ? styles.requestRemoving : ''}`}
                  >
                    <div className={styles.requestLeft}>
                      <div className={styles.requestAvatar}>
                        {r.fromAvatar ? (
                          <img
                            className={styles.requestAvatarImg}
                            src={r.fromAvatar}
                            alt={r.fromName}
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className={styles.requestAvatarEmoji}>{getAvatarEmoji(r.fromId)}</span>
                        )}
                      </div>
                      <div className={styles.requestInfo}>
                        <span className={styles.requestName}>{r.fromName}</span>
                        <span className={styles.requestMeta}>
                          {r.message || '申请添加你为好友'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.requestActions}>
                      <button
                        className={styles.requestActionBtn}
                        style={{ background: 'rgba(107, 203, 119, 0.15)', color: 'var(--success-dark)' }}
                        onClick={() => handleAccept(r.id, r.fromName)}
                        title="接受"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>done</span>
                      </button>
                      <button
                        className={styles.requestActionBtn}
                        style={{ background: 'rgba(186, 26, 26, 0.08)', color: 'var(--danger)' }}
                        onClick={() => setConfirmAction({ type: 'reject', requestId: r.id, name: r.fromName })}
                        title="拒绝"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 好友列表 ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <h2 className={styles.sectionTitle}>我的好友</h2>
              <span className={styles.friendCount}>共 {friends.length} 位好友</span>
            </div>
          </div>

          {friends.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔮</div>
              <div className={styles.emptyText}>还没有好友，快去添加吧</div>
            </div>
          ) : (
            <div className={styles.friendList}>
              {friends.map((f) => {
                const isRemoving = removingItems.has(f.id);
                const remark = getRemark(f.friendId);
                const displayName = remark || f.friendName;
                return (
                  <div
                    key={f.id}
                    className={`${styles.friendCard} ${isRemoving ? styles.friendRemoving : ''} ${menuFriend === f.friendId ? styles.friendCardActive : ''}`}
                  >
                    <div className={styles.friendMain}>
                      <div className={styles.friendAvatarWrap}>
                        {f.friendAvatar ? (
                          <img
                            className={styles.friendAvatar}
                            src={f.friendAvatar}
                            alt={f.friendName}
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className={styles.friendAvatarEmoji}>{getAvatarEmoji(f.friendId)}</span>
                        )}
                      </div>
                      <div className={styles.friendInfo}>
                        {editingRemark === f.friendId ? (
                          <div className={styles.remarkEditRow}>
                            <input
                              className={styles.remarkInput}
                              type="text"
                              value={remarkInput}
                              onChange={e => setRemarkInput(e.target.value)}
                              placeholder="输入备注名称"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRemarkSubmit(f.friendId);
                                if (e.key === 'Escape') setEditingRemark(null);
                              }}
                            />
                            <button
                              className={styles.remarkSaveBtn}
                              onClick={() => handleRemarkSubmit(f.friendId)}
                            >
                              确定
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className={styles.friendNameRow}>
                              <span
                                className={styles.friendName}
                                onClick={() => {
                                  setEditingRemark(f.friendId);
                                  setRemarkInput(remark || f.friendName);
                                  setMenuFriend(null);
                                }}
                              >
                                {displayName}
                              </span>
                              {remark && (
                                <span className={styles.friendOriginName}>{f.friendName}</span>
                              )}
                            </div>
                            {f.latestWorldName && (
                              <span className={styles.friendWorld}>
                                🌍 {f.latestWorldName}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        className={styles.menuBtn}
                        onClick={() => setMenuFriend(menuFriend === f.friendId ? null : f.friendId)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                          more_vert
                        </span>
                      </button>
                    </div>

                    {/* 展开操作菜单 */}
                    {menuFriend === f.friendId && (
                      <div className={styles.friendActions}>
                        <button
                          className={styles.friendActionItem}
                          onClick={() => {
                            setEditingRemark(f.friendId);
                            setRemarkInput(remark || f.friendName);
                            setMenuFriend(null);
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                          <span>修改备注</span>
                        </button>
                        <button
                          className={styles.friendActionItem}
                          onClick={() => {
                            setMenuFriend(null);
                            navigate(`/world/${f.friendId}`);
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>public</span>
                          <span>访问世界</span>
                        </button>
                        <button
                          className={`${styles.friendActionItem} ${styles.friendActionDanger}`}
                          onClick={() => setConfirmAction({
                            type: 'remove',
                            friendshipId: f.id,
                            friendId: f.friendId,
                            name: displayName,
                          })}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_remove</span>
                          <span>移除好友</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── 确认弹窗 ── */}
      {confirmAction && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmAction(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              {confirmAction.type === 'remove' ? '👋' : '❌'}
            </div>
            <div className={styles.confirmTitle}>
              {confirmAction.type === 'remove' ? '移除好友' : '拒绝请求'}
            </div>
            <div className={styles.confirmMessage}>
              {confirmAction.type === 'remove'
                ? `确定要移除「${confirmAction.name}」吗？每一段回忆都是珍贵的。`
                : `确定要拒绝「${confirmAction.name}」的好友请求吗？`}
            </div>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={() => setConfirmAction(null)}
              >
                取消
              </button>
              <button
                className={`${styles.confirmConfirm} ${confirmAction.type === 'remove' ? styles.confirmDanger : ''}`}
                onClick={confirmAction.type === 'remove' ? handleRemoveConfirm : handleRejectConfirm}
              >
                {confirmAction.type === 'remove' ? '确认移除' : '拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 装饰光晕 */}
      <div className={styles.ambientGlow1} />
      <div className={styles.ambientGlow2} />
    </div>
  );
}
