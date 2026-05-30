import { useState, useCallback } from 'react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const { theme, setTheme, nightMode, toggleNightMode, nightModeStart, nightModeEnd, setNightModeSchedule } = useThemeStore();
  const { currentUser, updateProfile, logout } = useAuthStore();

  const [editingProfile, setEditingProfile] = useState(false);
  const [nickname, setNickname] = useState(currentUser?.nickname || '');

  const handleSaveProfile = async () => {
    if (nickname.trim()) {
      await updateProfile({ nickname: nickname.trim() });
      setEditingProfile(false);
    }
  };

  const handleExport = useCallback(() => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('pw_')) {
        try { data[key] = JSON.parse(localStorage.getItem(key) || 'null'); } catch { data[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `private-world-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleClearCache = () => {
    if (confirm('确定要清除水晶球缓存吗？')) {
      localStorage.removeItem('pw_crystal');
      window.location.reload();
    }
  };

  const handleStart = (val: string) => {
    const n = parseInt(val);
    if (n >= 0 && n <= 23) setNightModeSchedule(n, nightModeEnd);
  };

  const handleEnd = (val: string) => {
    const n = parseInt(val);
    if (n >= 0 && n <= 23) setNightModeSchedule(nightModeStart, n);
  };

  if (!currentUser) return null;

  return (
    <div className={styles.page}>
      <div className={styles.title}>⚙️ 设置</div>

      {/* Profile */}
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>{currentUser.nickname.charAt(0)}</div>
        <div className={styles.profileInfo}>
          {editingProfile ? (
            <div className={styles.editRow}>
              <Input value={nickname} onChange={setNickname} placeholder="昵称" />
              <Button size="sm" onClick={handleSaveProfile}>保存</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>取消</Button>
            </div>
          ) : (
            <>
              <div className={styles.profileName}>{currentUser.nickname}</div>
              <div className={styles.profileUsername}>@{currentUser.username}</div>
              <div className={styles.profileJoined}>加入于 {new Date(currentUser.createdAt).toLocaleDateString()}</div>
            </>
          )}
        </div>
        {!editingProfile && <Button size="sm" variant="ghost" onClick={() => setEditingProfile(true)}>编辑</Button>}
      </div>

      {/* Appearance */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🎨</span> 外观
        </div>
        <div className={styles.optionCard}>
          <div className={styles.optionInfo}>
            <div className={styles.optionLabel}>深色模式</div>
            <div className={styles.optionDesc}>手动切换浅色/深色主题</div>
          </div>
          <div className={`${styles.toggle} ${theme === 'dark' ? styles.active : ''}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        </div>
        <div className={styles.optionCard}>
          <div className={styles.optionInfo}>
            <div className={styles.optionLabel}>深夜模式</div>
            <div className={styles.optionDesc}>定时自动切换深色主题</div>
          </div>
          <div className={`${styles.toggle} ${nightMode ? styles.active : ''}`} onClick={toggleNightMode} />
        </div>
        {nightMode && (
          <div className={styles.scheduleRow}>
            <span className={styles.scheduleLabel}>时间范围</span>
            <input className={styles.scheduleInput} type="number" min={0} max={23} value={nightModeStart} onChange={e => handleStart(e.target.value)} />
            <span className={styles.scheduleColon}>:</span>
            <span className={styles.scheduleTime}>00 — </span>
            <input className={styles.scheduleInput} type="number" min={0} max={23} value={nightModeEnd} onChange={e => handleEnd(e.target.value)} />
            <span className={styles.scheduleColon}>:</span>
            <span className={styles.scheduleTime}>00</span>
          </div>
        )}
      </div>

      {/* Data */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>💾</span> 数据
        </div>
        <div className={styles.dataCard}>
          <div className={styles.dataLabel}>导出数据</div>
          <Button size="sm" onClick={handleExport}>导出 JSON</Button>
        </div>
        <div className={styles.dataCard}>
          <div className={styles.dataLabel}>清除水晶球缓存</div>
          <Button size="sm" variant="secondary" onClick={handleClearCache}>清除</Button>
        </div>
      </div>

      {/* Help */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>❓</span> 帮助
        </div>
        <div className={styles.optionCard}>
          <div className={styles.optionInfo}>
            <div className={styles.optionLabel}>关于</div>
            <div className={styles.optionDesc}>私域小世界 v1.0.0 — 隐私型记录应用</div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>⚠️ 危险操作</div>
        <div className={styles.dangerDesc}>退出登录后需要重新登录才能访问数据</div>
        <Button variant="danger" onClick={() => logout()}>退出登录</Button>
      </div>
    </div>
  );
}
