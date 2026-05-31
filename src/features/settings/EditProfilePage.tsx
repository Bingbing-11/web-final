import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const { currentUser, updateProfile } = useAuthStore();
  const nightMode = useThemeStore(s => s.nightMode);

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastError, setToastError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToastMsg = useCallback((msg: string, isError = false) => {
    setToast(msg);
    setToastError(isError);
    setTimeout(() => setToast(''), 2500);
  }, []);

  // 上传新头像
  const handleUploadAvatar = useCallback(() => {
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = ev.target?.result as string;
          setSaving(true);
          try {
            await updateProfile({ avatar: base64 } as any);
            showToastMsg('头像已更新');
          } catch {
            showToastMsg('头像更新失败', true);
          } finally {
            setSaving(false);
          }
        };
        reader.readAsDataURL(file);
      };
      document.body.appendChild(input);
      (fileInputRef as any).current = input;
    }
    fileInputRef.current?.click();
  }, [updateProfile, showToastMsg]);

  // 保存昵称
  const handleSaveNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      showToastMsg('昵称不能为空', true);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ nickname: trimmed } as any);
      setNickname(trimmed);
      setShowNicknameModal(false);
      showToastMsg('昵称已更新');
    } catch {
      showToastMsg('昵称更新失败', true);
    } finally {
      setSaving(false);
    }
  };

  // 深夜模式判定
  const isNightTime = (): boolean => {
    if (!nightMode) return false;
    const now = new Date().getHours();
    const { nightModeStart, nightModeEnd } = useThemeStore.getState();
    if (nightModeStart < nightModeEnd) {
      return now >= nightModeStart && now < nightModeEnd;
    }
    return now >= nightModeStart || now < nightModeEnd;
  };

  if (!currentUser) return null;

  return (
    <div className={styles.page}>
      {/* 夜间暗角遮罩 */}
      {nightMode && isNightTime() && <div className={styles.nightOverlay} />}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toastError ? styles.toastError : ''}`}>
          {toast}
        </div>
      )}

      {/* 头像 */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarRing}>
          {currentUser.avatar ? (
            <img className={styles.avatarImg} src={currentUser.avatar} alt={currentUser.nickname} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {currentUser.nickname.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* 操作列表 */}
      <div className={styles.actionList}>
        <button className={styles.actionItem} onClick={handleUploadAvatar} disabled={saving}>
          <div className={styles.actionIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <span className={styles.actionLabel}>上传新头像</span>
          <svg className={styles.actionArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button className={styles.actionItem} onClick={() => { setNickname(currentUser.nickname); setShowNicknameModal(true); }}>
          <div className={styles.actionIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <span className={styles.actionLabel}>编辑昵称</span>
          <svg className={styles.actionArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 昵称编辑弹窗 */}
      {showNicknameModal && (
        <div className={styles.nicknameOverlay} onClick={() => setShowNicknameModal(false)}>
          <div className={styles.nicknameSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.nicknameSheetTitle}>修改昵称</div>
            <input
              className={styles.nicknameInput}
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入新昵称"
              maxLength={20}
              autoFocus
            />
            <div className={styles.nicknameActions}>
              <button className={styles.nicknameCancel} onClick={() => setShowNicknameModal(false)}>
                取消
              </button>
              <button
                className={styles.nicknameSave}
                onClick={handleSaveNickname}
                disabled={!nickname.trim() || saving}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
