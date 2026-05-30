import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorldStore } from '../../stores/useWorldStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { matchScenes } from '../../lib/crystal/sceneEngine';
import { DEFAULT_CRYSTAL_PARAMS } from '../../lib/crystal/materialEngine';
import CrystalCanvas from '../../components/crystal/CrystalCanvas';
import EntryCard from '../../components/common/EntryCard';
import Button from '../../components/common/Button';
import styles from './WorldDetail.module.css';

export default function WorldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const world = useWorldStore(s => s.getWorld(id || ''));
  const entries = useEntryStore(s => s.entries.filter(e => e.worldId === id));

  const sceneWeights = useMemo(() => {
    if (!entries.length) return { default_nebula: 1 };
    const latest = entries.slice(0, 50);
    const merged: Record<string, number> = {};
    latest.forEach(e => {
      const sw = matchScenes(e);
      for (const [k, v] of Object.entries(sw)) merged[k] = (merged[k] || 0) + v;
    });
    return merged;
  }, [entries]);

  if (!world) return <div className={styles.empty}>世界不存在</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.worldName}>
          <span>{world.icon || '🌍'}</span> {world.name}
          {world.isSealed && <span className={styles.sealedLabel}>已封存</span>}
        </div>
        <div className={styles.worldDesc}>{world.description}</div>
      </div>
      <div className={styles.crystalSection}>
        <CrystalCanvas params={{ ...DEFAULT_CRYSTAL_PARAMS }} sceneWeights={sceneWeights} isSealed={world.isSealed} />
      </div>
      {!world.isSealed && (
        <div className={styles.actions}>
          <Button onClick={() => navigate(`/world/${id}/entry/new`)}>✏️ 写日记</Button>
          <Button variant="secondary" onClick={() => navigate(`/world/${id}/settings`)}>⚙️ 设置</Button>
          <Button variant="ghost" onClick={() => navigate(`/world/${id}/temple`)}>🏛️ 圣殿</Button>
        </div>
      )}
      <div className={styles.sectionTitle}>日记 ({entries.length})</div>
      {entries.length === 0 ? (
        <div className={styles.empty}>还没有日记，写第一篇吧</div>
      ) : (
        <div className={styles.entryList}>
          {entries.slice(0, 20).map(e => <EntryCard key={e.id} entry={e} />)}
        </div>
      )}
      <div className={styles.bottomNav}>
        <Link to={`/world/${id}/permissions`}><Button variant="ghost" size="sm">权限管理</Button></Link>
        <Link to="/timecapsule"><Button variant="ghost" size="sm">⏳ 时光机</Button></Link>
      </div>
    </div>
  );
}
