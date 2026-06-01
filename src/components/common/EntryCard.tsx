import { useNavigate } from 'react-router-dom';
import type { Entry } from '../../types/entry';
import styles from './EntryCard.module.css';

interface Props {
  entry: Entry;
  showActions?: boolean;
  onFlowToResonance?: (entry: Entry) => void;
}

const MODE_LABELS: Record<string, string> = {
  normal: '普通', burn: '灰烬', timecapsule: '胶囊', futurelook: '致未来', collection: '收藏',
};

const MODE_STYLES: Record<string, string> = {
  normal: styles.modeNormal, burn: styles.modeBurn, timecapsule: styles.modeCapsule,
  futurelook: styles.modeFuture, collection: styles.modeCollection,
};

export default function EntryCard({ entry, showActions, onFlowToResonance }: Props) {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/world/${entry.worldId}/entry/${entry.id}/edit`);
  };

  const handleFlowToResonance = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFlowToResonance?.(entry);
  };

  return (
    <div className={styles.card} onClick={() => navigate(`/entry/${entry.id}`)} style={{ '--emotion-color': `hsl(${entry.emotionHue || 180}, 60%, 60%)` } as React.CSSProperties}>
      <div className={styles.header}>
        <div className={styles.title}>{entry.title || '无标题'}</div>
        {entry.emotion && (
          <span className={styles.emotion}>
            <span className={styles.dot} />
            {entry.emotion}
          </span>
        )}
      </div>
      <div className={styles.preview}>{entry.content}</div>
      <div className={styles.footer}>
        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
        <span className={`${styles.mode} ${MODE_STYLES[entry.mode] || ''}`}>
          {MODE_LABELS[entry.mode] || entry.mode}
        </span>
      </div>
      {showActions && (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleEdit}>✏️ 编辑</button>
          <button className={styles.actionBtn} onClick={handleFlowToResonance}>✨ 流向共鸣池</button>
        </div>
      )}
    </div>
  );
}
