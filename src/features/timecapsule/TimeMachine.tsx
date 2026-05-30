import { useState, useMemo } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { useWorldStore } from '../../stores/useWorldStore';
import Input from '../../components/common/Input';
import EntryCard from '../../components/common/EntryCard';
import type { EntryMode } from '../../types/entry';
import styles from './TimeMachine.module.css';

const MODE_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' }, { value: 'normal', label: '普通' },
  { value: 'burn', label: '灰烬' }, { value: 'timecapsule', label: '胶囊' },
  { value: 'futurelook', label: '致未来' }, { value: 'collection', label: '收藏' },
];

export default function TimeMachine() {
  const user = useAuthStore(s => s.currentUser);
  const allEntries = useEntryStore(s => s.entries).filter(e => e.userId === user?.id);
  const worlds = useWorldStore(s => s.worlds).filter(w => w.ownerId === user?.id);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [worldFilter, setWorldFilter] = useState('all');

  const filtered = useMemo(() => {
    let entries = allEntries;
    if (modeFilter !== 'all') entries = entries.filter(e => e.mode === modeFilter);
    if (worldFilter !== 'all') entries = entries.filter(e => e.worldId === worldFilter);
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter(e => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || (e.emotion || '').includes(q));
    }
    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allEntries, modeFilter, worldFilter, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(e => {
      const date = new Date(e.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    });
    return groups;
  }, [filtered]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.title}>⏳ 时光机</div>
      </div>
      <div className={styles.search}>
        <Input value={search} onChange={setSearch} type="search" placeholder="搜索日记、情绪、关键词..." />
      </div>
      <div className={styles.filters}>
        {MODE_FILTERS.map(f => (
          <div key={f.value} className={`${styles.filterChip} ${modeFilter === f.value ? styles.active : ''}`} onClick={() => setModeFilter(f.value)}>
            {f.label}
          </div>
        ))}
        {worlds.length > 1 && (
          <select value={worldFilter} onChange={e => setWorldFilter(e.target.value)} className={styles.worldSelect}>
            <option value="all">所有世界</option>
            {worlds.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        )}
      </div>
      {Object.keys(grouped).length === 0 ? (
        <div className={styles.empty}>暂无日记</div>
      ) : (
        Object.entries(grouped).map(([date, entries]) => (
          <div key={date} className={styles.dateGroup}>
            <div className={styles.dateLabel}>
              <span className={styles.dateDot} /> {date} ({entries.length})
            </div>
            <div className={styles.timeline}>
              {entries.map(e => <div key={e.id} className={styles.entry}><EntryCard entry={e} /></div>)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
