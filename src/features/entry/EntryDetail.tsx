import { useParams } from 'react-router-dom';
import { useEntryStore } from '../../stores/useEntryStore';
import { useWorldStore } from '../../stores/useWorldStore';
import styles from './EntryDetail.module.css';

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const entry = useEntryStore(s => s.getEntry(id || ''));
  const world = useWorldStore(s => s.getWorld(entry?.worldId || ''));

  if (!entry) return <div>日记不存在</div>;

  return (
    <div className={styles.page} style={{ '--emotion-color': `hsl(${entry.emotionHue || 180}, 60%, 60%)` } as React.CSSProperties}>
      <div className={styles.title}>{entry.title || '无标题'}</div>
      <div className={styles.meta}>
        {entry.emotion && (
          <span className={styles.emotionBadge}>
            <span className={styles.dot} />
            {entry.emotion}
          </span>
        )}
        <span>{world?.name || '未知世界'}</span>
        <span>{new Date(entry.createdAt).toLocaleString()}</span>
      </div>
      <div className={styles.content}>{entry.content}</div>
      {entry.keywords.length > 0 && (
        <div className={styles.keywords}>
          {entry.keywords.map(kw => <span key={kw} className={styles.keyword}>#{kw}</span>)}
        </div>
      )}
    </div>
  );
}
