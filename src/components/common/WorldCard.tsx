import { Link } from 'react-router-dom';
import type { World } from '../../types/world';
import styles from './WorldCard.module.css';

interface Props {
  world: World;
}

export default function WorldCard({ world }: Props) {
  return (
    <Link to={`/world/${world.id}`} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>{world.icon || '🌍'}</div>
        <div className={styles.info}>
          <div className={styles.name}>{world.name}</div>
          <div className={styles.desc}>{world.description}</div>
        </div>
        {world.isSealed && <span className={styles.badge}>已封存</span>}
      </div>
      <div className={styles.stats}>
        <span className={styles.stat}>📝 {world.entryCount} 篇</span>
        <span className={styles.stat}>📅 {new Date(world.updatedAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
