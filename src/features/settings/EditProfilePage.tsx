import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuthStore();
  const nightMode = useThemeStore(s => s.nightMode);
  const nightModeStart = useThemeStore(s => s.nightModeStart);
  const nightModeEnd = useThemeStore(s => s.nightModeEnd);

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastError, setToastError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 是否在深夜模式时间范围内 */
  const isNightTime = (): boolean => {
    if (!nightMode) return false;
    const now = new Date().getHours();
    if (nightModeStart < nightModeEnd) {
      return now >= nightModeStart && now < nightModeEnd;
    }
    return now >= nightModeStart || now < nightModeEnd;
  };

  const isNight = isNightTime();

  const showToastMsg = useCallback((msg: string, isError = false) => {
    setToast(msg);
    setToastError(isError);
    setTimeout(() => setToast(''), 2500);
  }, []);

  /* 上传新头像 */
  const handleUploadAvatar = useCallback(() => {
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
    input.click();
    document.body.removeChild(input);
  }, [updateProfile, showToastMsg]);

  /* 保存昵称 */
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

  if (!currentUser) return null;

  return (
    <div className={`${styles.page} ${isNight ? styles.pageNight : ''}`}>
      {/* 深夜模式暗角遮罩 */}
      {isNight && <div className={styles.nightOverlay} />}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toastError ? styles.toastError : ''}`}>
          {toast}
        </div>
      )}

      {/* 顶部栏 */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className={styles.topBarTitle}>编辑资料</h1>
      </header>

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
            <span className="material-symbols-outlined">add_photo_alternate</span>
          </div>
          <span className={styles.actionLabel}>上传新头像</span>
          <span className={`material-symbols-outlined ${styles.actionArrow}`}>chevron_right</span>
        </button>

        <button className={styles.actionItem} onClick={() => { setNickname(currentUser.nickname); setShowNicknameModal(true); }}>
          <div className={styles.actionIcon}>
            <span className="material-symbols-outlined">edit</span>
          </div>
          <span className={styles.actionLabel}>编辑昵称</span>
          <span className={`material-symbols-outlined ${styles.actionArrow}`}>chevron_right</span>
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
