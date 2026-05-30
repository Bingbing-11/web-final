import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorldStore } from '../../stores/useWorldStore';
import { useFriendStore } from '../../stores/useFriendStore';
import { useAuthStore } from '../../stores/useAuthStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import UserAvatar from '../../components/common/UserAvatar';
import type { WorldPermission } from '../../types/world';
import styles from './PermissionsPage.module.css';

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  owner: { label: '所有者', cls: styles.roleOwner },
  editor: { label: '编辑者', cls: styles.roleEditor },
  viewer: { label: '查看者', cls: styles.roleViewer },
};

export default function PermissionsPage() {
  const { id } = useParams<{ id: string }>();
  const world = useWorldStore(s => s.getWorld(id || ''));
  const updateWorld = useWorldStore(s => s.updateWorld);
  const user = useAuthStore(s => s.currentUser);
  const friends = useFriendStore(s => s.getFriends(user?.id || ''));

  const [inviteId, setInviteId] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('private');

  if (!world) return <div>世界不存在</div>;

  const owner = user?.id === world.ownerId;

  const handleRoleChange = async (userId: string, newRole: string) => {
    const perms = world.permissions.map(p =>
      p.userId === userId ? { ...p, role: newRole as WorldPermission['role'] } : p
    );
    await updateWorld(world.id, { permissions: perms });
  };

  const handleInvite = async () => {
    if (!inviteId.trim()) return;
    const newPerm: WorldPermission = {
      userId: inviteId.trim(),
      role: 'viewer',
      grantedAt: new Date().toISOString(),
    };
    if (world.permissions.find(p => p.userId === newPerm.userId)) return;
    await updateWorld(world.id, { permissions: [...world.permissions, newPerm] });
    setInviteId('');
  };

  const handleRemove = async (userId: string) => {
    await updateWorld(world.id, { permissions: world.permissions.filter(p => p.userId !== userId) });
  };

  return (
    <div className={styles.page}>
      <div className={styles.title}>🔐 权限管理</div>
      <div className={styles.desc}>{world.name} 的成员与权限设置</div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>👥 成员列表</div>
        <div className={styles.memberItem}>
          <UserAvatar name={user?.nickname || '?'} />
          <div className={styles.memberInfo}>
            <div className={styles.memberName}>{user?.nickname || '你'}</div>
            <div className={styles.memberSince}>创建者</div>
          </div>
          <span className={`${styles.roleBadge} ${ROLE_LABELS.owner.cls}`}>{ROLE_LABELS.owner.label}</span>
        </div>
        {world.permissions.length === 0 ? (
          <div className={styles.empty}>暂无共享成员</div>
        ) : world.permissions.map(p => (
          <div key={p.userId} className={styles.memberItem}>
            <div className={styles.memberInfo}>
              <div className={styles.memberName}>用户 {p.userId.slice(0, 8)}...</div>
              <div className={styles.memberSince}>添加于 {new Date(p.grantedAt).toLocaleDateString()}</div>
            </div>
            {owner && (
              <div className={styles.roleActions}>
                <select
                  className={styles.roleSelect}
                  value={p.role}
                  onChange={e => handleRoleChange(p.userId, e.target.value)}
                >
                  <option value="viewer">查看者</option>
                  <option value="editor">编辑者</option>
                </select>
                <Button size="sm" variant="ghost" onClick={() => handleRemove(p.userId)}>移除</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {owner && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>📝 邀请成员</div>
          <div className={styles.inviteCard}>
            <div className={styles.inviteText}>输入用户ID或从好友中选择</div>
            <div className={styles.inviteRow}>
              <Input value={inviteId} onChange={setInviteId} placeholder="输入用户ID" />
              <Button size="sm" onClick={handleInvite}>邀请</Button>
            </div>
            {friends.length > 0 && (
              <div className={styles.friendInviteList}>
                {friends.map(f => (
                  <div key={f.id} className={styles.friendInviteItem}>
                    <span className={styles.friendInviteName}>{f.friendName}</span>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      if (!world.permissions.find(p => p.userId === f.friendId)) {
                        const newPerm: WorldPermission = { userId: f.friendId, role: 'viewer', grantedAt: new Date().toISOString() };
                        await updateWorld(world.id, { permissions: [...world.permissions, newPerm] });
                      }
                    }}>
                      {world.permissions.find(p => p.userId === f.friendId) ? '已邀请' : '邀请'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>👁️ 世界可见性</div>
        <div className={styles.visibilityCard}>
          {([
            { value: 'private' as const, label: '仅自己', desc: '只有你能看到这个世界' },
            { value: 'friends' as const, label: '好友可见', desc: '你的好友可以看到这个世界' },
            { value: 'public' as const, label: '公开', desc: '所有人都可以看到这个世界' },
          ]).map(opt => (
            <div key={opt.value} className={styles.visibilityOption}>
              <div>
                <div className={styles.visibilityLabel}>{opt.label}</div>
                <div className={styles.visibilityDesc}>{opt.desc}</div>
              </div>
              <div
                className={`${styles.toggleSwitch} ${visibility === opt.value ? styles.active : ''}`}
                onClick={() => setVisibility(opt.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
