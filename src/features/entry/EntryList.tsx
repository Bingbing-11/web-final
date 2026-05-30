import { useState, useMemo } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useEntryStore } from '../../stores/useEntryStore';
import Input from '../../components/common/Input';
import EntryCard from '../../components/common/EntryCard';
import styles from './EntryList.module.css';

export default function EntryList() {
  const user = useAuthStore(s => s.currentUser);
  const allEntries = useEntryStore(s => s.entries).filter(e => e.userId === user?.id && e.status !== 'burned');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return allEntries;
    const q = search.toLowerCase();
    return allEntries.filter(e => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q));
  }, [allEntries, search]);

  return (
    <div className={styles.page}>
      <div className={styles.title}>📚 全部日记</div>
      <div className={styles.search}>
        <Input value={search} onChange={setSearch} type="search" placeholder="搜索日记..." />
      </div>
      {filtered.length === 0 ? (
        <div className={styles.empty}>{search ? '没有找到匹配的日记' : '还没有日记'}</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(e => <EntryCard key={e.id} entry={e} />)}
        </div>
      )}
    </div>
  );
}
