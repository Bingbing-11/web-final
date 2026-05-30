import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorldStore } from '../../stores/useWorldStore';
import { useEntryStore } from '../../stores/useEntryStore';
import CrystalCanvas from '../../components/crystal/CrystalCanvas';
import Button from '../../components/common/Button';
import styles from './TemplePage.module.css';

export default function TemplePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const world = useWorldStore(s => s.getWorld(id || ''));
  const entries = useEntryStore(s => s.entries.filter(e => e.worldId === id));
  const fetchEntries = useEntryStore(s => s.fetchEntries);
  const unsealWorld = useWorldStore(s => s.unsealWorld);
  const [confirmUnseal, setConfirmUnseal] = useState(false);

  useEffect(() => {
    if (id) fetchEntries(id);
  }, [id, fetchEntries]);

  const stats = useMemo(() => {
    const emotions = new Set(entries.map(e => e.emotion).filter(Boolean));
    const emotionCounts: Record<string, number> = {};
    entries.forEach(e => { if (e.emotion) emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1; });
    const dates = entries.map(e => new Date(e.createdAt).getTime());
    return {
      total: entries.length,
      emotionTypes: emotions.size,
      earliest: dates.length ? new Date(Math.min(...dates)).toLocaleDateString() : '-',
      latest: dates.length ? new Date(Math.max(...dates)).toLocaleDateString() : '-',
      emotionCounts,
    };
  }, [entries]);

  if (!world) return <div>世界不存在</div>;

  const handleUnseal = async () => {
    await unsealWorld(world.id);
    navigate(`/world/${world.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.title}>🏛️ 记忆圣殿</div>
      <div className={styles.subtitle}>{world.name}</div>
      <div className={styles.crystalFrame}>
        <div className={styles.crystalInner}>
          <CrystalCanvas isSealed />
        </div>
      </div>
      <div className={styles.stats}>
        <div className={styles.statCard}><div className={styles.statValue}>{stats.total}</div><div className={styles.statLabel}>日记篇数</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{stats.emotionTypes}</div><div className={styles.statLabel}>情绪种类</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{stats.earliest}</div><div className={styles.statLabel}>最早记录</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{stats.latest}</div><div className={styles.statLabel}>最近记录</div></div>
      </div>
      <div className={styles.emotionCloud}>
        {Object.entries(stats.emotionCounts).sort(([, a], [, b]) => b - a).map(([e, count]) => (
          <span key={e} className={styles.emotionTag} style={{ '--emotion-size': `${12 + count * 2}px` } as React.CSSProperties}>{e} ({count})</span>
        ))}
      </div>
      <div className={styles.unsealSection}>
        {world.sealedAt && <div className={styles.sealedDate}>封存于 {new Date(world.sealedAt).toLocaleDateString()}</div>}
        {!confirmUnseal ? (
          <button className={styles.unsealBtn} onClick={() => setConfirmUnseal(true)}>🔓 解除封存</button>
        ) : (
          <div className={styles.confirm}>
            <div className={styles.confirmText}>确定要解除封存吗？记忆圣殿的陈列将被还原为活跃世界。</div>
            <div className={styles.confirmActions}>
              <Button size="sm" onClick={() => setConfirmUnseal(false)}>取消</Button>
              <Button size="sm" variant="danger" onClick={handleUnseal}>确认解封</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
