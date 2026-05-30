import { useState, useEffect, useCallback } from 'react';
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

/* ── 主组件 ── */
export default function FriendList() {
  const user = useAuthStore(s => s.currentUser);
  const friends = useFriendStore(s => s.getFriends(user?.id || ''));
  const pendingRequests = useFriendStore(s => s.getPendingRequests(user?.id || ''));
  const sentRequests = useFriendStore(s => s.getSentRequests(user?.id || ''));
  const { fetchFriends, fetchRequests, searchUser, sendRequest, acceptRequest, rejectRequest, removeFriend } = useFriendStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState<Record<string, string>>(loadRemarks);

  /* 数据加载 */
  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [fetchFriends, fetchRequests]);

  const pendingCount = pendingRequests.length;

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
    },
    [remarks],
  );

  return (
    <div className={styles.page}>
      {/* ── 浮动光晕 ── */}
      <div className={styles.atmoDeco1} />
      <div className={styles.atmoDeco2} />

      {/* ── 主内容 ── */}
      <div className={styles.main}>
        {/* 搜索栏 */}
        <section className={styles.searchSection}>
          <div className={`${styles.searchBar} ${styles.glassCard}`}>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchInputIcon}>🔍</span>
              <input
                className={styles.searchInput}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索 ID / 昵称添加好友"
                onKeyDown={e => e.key === 'Enter' && handleAddFriend()}
              />
            </div>
            <button
              className={styles.searchSubmit}
              disabled={loading}
              onClick={handleAddFriend}
            >
              {loading ? '搜索中…' : '搜索'}
            </button>
          </div>
          {feedback && (
            <div className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
              {feedback.msg}
            </div>
          )}
        </section>

        {/* 好友请求 */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              好友请求
              {pendingCount > 0 && <span className={styles.sectionBadge}>{pendingCount}</span>}
            </h2>
          </div>
          {pendingRequests.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📭</div>
              <div>暂无好友请求</div>
            </div>
          ) : (
            <div className={styles.requestsList}>
              {pendingRequests.map((r, i) => (
                <div
                  key={r.id}
                  className={`${styles.requestItem} ${styles.glassCard}`}
                  style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
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
                      {r.message ? (
                        <span className={styles.requestMeta}>"{r.message}"</span>
                      ) : (
                        <span className={styles.requestMeta}>申请添加你为好友</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.requestActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleAccept(r.id)}
                      title="接受"
                    >
                      <span className={styles.actionBtnIcon}>✅</span>
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
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
        </section>

        {/* 已发送请求 */}
        {sentRequests.length > 0 && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>已发送的请求</h2>
              <span className={styles.sectionCount}>共 {sentRequests.length} 条</span>
            </div>
            <div className={styles.requestsList}>
              {sentRequests.map((r, i) => (
                <div
                  key={r.id}
                  className={`${styles.sentItem} ${styles.glassCard}`}
                  style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
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
          </section>
        )}

        {/* 好友列表 */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>我的好友</h2>
            <span className={styles.sectionCount}>共 {friends.length} 位好友</span>
          </div>
          {friends.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🌱</div>
              <div>还没有好友<br />搜索 ID 或昵称来添加第一位朋友吧</div>
            </div>
          ) : (
            <div className={styles.friendGrid}>
              {friends.map(f => (
                <div key={f.id} className={`${styles.friendCard} ${styles.glassCard}`}>
                  <div className={styles.friendRow}>
                    <div className={styles.friendLeft}>
                      <img
                        className={styles.friendAvatar}
                        src={f.friendAvatar || ''}
                        alt={f.friendName}
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className={styles.friendInfo}>
                        <div className={styles.friendNameRow}>
                          <span className={styles.friendName}>
                            {remarks[f.friendId] || f.friendName}
                          </span>
                          <button
                            className={styles.friendEditBtn}
                            onClick={() => handleEditRemark(f.friendId, f.friendName)}
                            title="修改备注"
                          >
                            <span className={styles.friendEditIcon}>✏️</span>
                          </button>
                        </div>
                        <span className={styles.friendRemark}>
                          备注：{remarks[f.friendId] || '未设置'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.friendHoverActions}>
                      <button
                        className={`${styles.friendActionBtn} ${styles.friendActionChat}`}
                        title="发消息"
                      >
                        <span className={styles.friendActionIcon}>💬</span>
                      </button>
                      <button
                        className={styles.friendActionBtn}
                        onClick={() => handleRemove(f.id)}
                        title="移除好友"
                      >
                        <span className={styles.friendActionIcon}>👋</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
