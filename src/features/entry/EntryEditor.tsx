import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { useCrystalStore } from '../../stores/useCrystalStore';
import { EMOTION_PRESETS } from '../../lib/constants';
import { analyzeEmotion, extractKeywords } from '../../lib/crystal';
import { DEFAULT_CRYSTAL_PARAMS } from '../../lib/crystal/materialEngine';
import { matchScenes } from '../../lib/crystal/sceneEngine';
import type { EntryMode } from '../../types/entry';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './EntryEditor.module.css';

const MODES: { value: EntryMode; label: string; emoji: string }[] = [
  { value: 'normal', label: '普通', emoji: '📝' },
  { value: 'burn', label: '灰烬', emoji: '🔥' },
  { value: 'timecapsule', label: '胶囊', emoji: '⏰' },
  { value: 'futurelook', label: '致未来', emoji: '💌' },
  { value: 'collection', label: '收藏', emoji: '⭐' },
];

export default function EntryEditor() {
  const { worldId, entryId } = useParams<{ worldId: string; entryId?: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.currentUser);
  const addEntry = useEntryStore(s => s.addEntry);
  const updateEntry = useEntryStore(s => s.updateEntry);
  const getEntry = useEntryStore(s => s.getEntry);
  const updateCache = useCrystalStore(s => s.updateCache);

  const isEdit = !!entryId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<EntryMode>('normal');
  const [emotion, setEmotion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* 编辑模式：加载已有条目数据 */
  useEffect(() => {
    if (!entryId) return;
    const existing = getEntry(entryId);
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
      setMode(existing.mode);
      setEmotion(existing.emotion || '');
    }
  }, [entryId, getEntry]);

  const handleSubmit = async () => {
    if (!title && !content || submitting) return;
    setSubmitting(true);
    const text = `${title} ${content}`;
    const { emotion: detectedEmotion, hue } = analyzeEmotion(text);
    const keywords = extractKeywords(text);
    const emotionResult = emotion || detectedEmotion;

    if (isEdit && entryId) {
      /* 编辑模式：更新现有条目 */
      await updateEntry(entryId, {
        title,
        content,
        mode,
        emotion: emotionResult,
        emotionHue: hue,
        keywords,
      });
      navigate(`/world/${worldId}`);
    } else {
      /* 新建模式 */
      const entry = await addEntry({
        worldId: worldId || '',
        userId: user!.id,
        title,
        content,
        mode,
        status: 'published',
        emotion: emotionResult,
        emotionHue: hue,
        keywords,
      });

      if (entry) {
        // Update crystal cache
        const sw = matchScenes(entry);
        const params = { ...DEFAULT_CRYSTAL_PARAMS, hue };
        updateCache(worldId || '', params);

        if (mode === 'burn') {
          navigate(`/entry/${entry.id}/burn`);
        } else {
          navigate(`/world/${worldId}`);
        }
      }
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.title}>{isEdit ? '✏️ 编辑日记' : '✏️ 写日记'}</div>
      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.label}>日记模式</span>
          <div className={styles.modeSelector}>
            {MODES.map(m => (
              <div key={m.value} className={`${styles.modeOption} ${mode === m.value ? styles.active : ''}`} onClick={() => setMode(m.value)}>
                {m.emoji} {m.label}
              </div>
            ))}
          </div>
          {mode === 'burn' && <span className={styles.hint}>灰烬模式：阅读一次后即焚毁</span>}
          {mode === 'timecapsule' && <span className={styles.hint}>胶囊模式：封存后定时开启</span>}
        </div>
        <div className={styles.field}>
          <span className={styles.label}>标题</span>
          <Input value={title} onChange={setTitle} placeholder="给这篇日记起个标题" />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>内容</span>
          <Input value={content} onChange={setContent} placeholder="今天发生了什么..." multiline />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>情绪（可选，不选将自动识别）</span>
          <div className={styles.emotionTags}>
            {EMOTION_PRESETS.map(e => (
              <div key={e} className={`${styles.emotionTag} ${emotion === e ? styles.active : ''}`} onClick={() => setEmotion(emotion === e ? '' : e)}>
                {e}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <Button onClick={() => navigate(-1)} variant="secondary">取消</Button>
          <Button onClick={handleSubmit} fullWidth disabled={submitting} variant="primary">{submitting ? '保存中...' : isEdit ? '保存修改' : '发布'}</Button>
        </div>
      </div>
    </div>
  );
}
