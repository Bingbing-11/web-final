import { useState, useMemo } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useResonanceStore } from '../../stores/useResonanceStore';
import { useWorldStore } from '../../stores/useWorldStore';
import { analyzeEmotion, extractKeywords } from '../../lib/crystal';
import { EMOTION_PRESETS } from '../../lib/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './ResonancePage.module.css';

const REACTION_TYPES = ['❤️', '🌟', '💫', '🙏', '🔥', '😢'];

export default function ResonancePage() {
  const user = useAuthStore(s => s.currentUser);
  const resonances = useResonanceStore(s => s.resonances);
  const addResonance = useResonanceStore(s => s.addResonance);
  const addReaction = useResonanceStore(s => s.addReaction);
  const worlds = useWorldStore(s => s.worlds).filter(w => w.ownerId === user?.id && !w.isSealed);

  const [content, setContent] = useState('');
  const [isAnon, setIsAnon] = useState(true);
  const [selectedWorld, setSelectedWorld] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('all');

  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!content.trim() || !user || publishing) return;
    setPublishing(true);
    const { emotion, hue } = analyzeEmotion(content);
    const keywords = extractKeywords(content);
    const world = worlds.find(w => w.id === selectedWorld);

    await addResonance({
      worldId: selectedWorld || undefined,
      worldName: world?.name,
      authorId: user.id,
      authorName: isAnon ? '匿名旅人' : user.nickname,
      emotion,
      emotionHue: hue,
      content: content.trim(),
      keywords,
      isAnonymous: isAnon,
    });
    setContent('');
    setPublishing(false);
  };

  const filtered = useMemo(() => {
    let items = resonances;
    if (emotionFilter !== 'all') items = items.filter(r => r.emotion === emotionFilter);
    return items;
  }, [resonances, emotionFilter]);

  const emotionOptions = useMemo(() => {
    const emotions = new Set(resonances.map(r => r.emotion));
    return EMOTION_PRESETS.filter(e => emotions.has(e));
  }, [resonances]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>✨ 共鸣池</div>
          <div className={styles.subtitle}>分享你的心情，让灵魂在此相遇</div>
        </div>
      </div>

      <div className={styles.publishCard}>
        <div className={styles.publishTitle}>🎤 发表共鸣</div>
        <div className={styles.publishForm}>
          <Input value={content} onChange={setContent} placeholder="此刻的心情是..." multiline />
          <div className={styles.publishRow}>
            <div className={styles.anonToggle} onClick={() => setIsAnon(!isAnon)}>
              <div className={`${styles.toggleSwitch} ${isAnon ? styles.active : ''}`} />
              <span>{isAnon ? '匿名发布' : '实名发布'}</span>
            </div>
            {worlds.length > 0 && (
              <select
                value={selectedWorld}
                onChange={e => setSelectedWorld(e.target.value)}
                className={styles.worldSelect}
              >
                <option value="">不关联世界</option>
                {worlds.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            )}
            <div className={styles.publishSpacer} />
            <Button size="sm" onClick={handlePublish} disabled={publishing}>{publishing ? '发布中...' : '发布'}</Button>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={`${styles.filterChip} ${emotionFilter === 'all' ? styles.active : ''}`} onClick={() => setEmotionFilter('all')}>
          全部
        </div>
        {emotionOptions.map(e => (
          <div key={e} className={`${styles.filterChip} ${emotionFilter === e ? styles.active : ''}`} onClick={() => setEmotionFilter(e)}>
            {e}
          </div>
        ))}
      </div>

      <div className={styles.cloud}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🌊</div>
            <div>共鸣池还是空的<br />成为第一个分享心情的人</div>
          </div>
        ) : filtered.map(r => {
          const myReactions = user ? r.reactions.filter(rc => rc.userId === user.id).map(rc => rc.type) : [];

          return (
            <div key={r.id} className={styles.resonanceItem} style={{ '--emotion-color': `hsl(${r.emotionHue}, 60%, 60%)` } as React.CSSProperties}>
              <div className={styles.resonanceAccent} />
              <div className={styles.resonanceHeader}>
                <span className={styles.resonanceAuthor}>
                  {r.isAnonymous ? '🫥' : '👤'} {r.authorName}
                </span>
                <span className={styles.resonanceTime}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.resonanceEmotion}>
                <span className={styles.emotionDot} />
                {r.emotion}
              </div>
              <div className={styles.resonanceContent}>{r.content}</div>
              {r.worldName && <div className={styles.resonanceWorld}>🌍 {r.worldName}</div>}
              {r.keywords.length > 0 && (
                <div className={styles.resonanceKeywords}>
                  {r.keywords.map(kw => <span key={kw} className={styles.resonanceKeyword}>#{kw}</span>)}
                </div>
              )}
              <div className={styles.reactions}>
                {REACTION_TYPES.map(type => {
                  const count = r.reactions.filter(rc => rc.type === type).length;
                  const isActive = myReactions.includes(type);
                  return (
                    <button
                      key={type}
                      className={`${styles.reactionBtn} ${isActive ? styles.active : ''}`}
                      onClick={() => user && addReaction(r.id, user.id, type)}
                    >
                      {type}
                      {count > 0 && <span className={styles.reactionCount}>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
