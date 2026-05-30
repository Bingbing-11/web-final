import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWorldStore } from '../../stores/useWorldStore';
import WorldCard from '../../components/common/WorldCard';
import Button from '../../components/common/Button';
import styles from './WorldHub.module.css';

export default function WorldHub() {
  const user = useAuthStore(s => s.currentUser);
  const worlds = useWorldStore(s => s.worlds).filter(w => w.ownerId === user?.id);
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {worlds.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🌍</div>
          <div className={styles.emptyText}>还没有世界，创建一个开始记录吧</div>
          <Button onClick={() => navigate('/world/create')}>创建第一个世界</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {worlds.map(w => <WorldCard key={w.id} world={w} />)}
        </div>
      )}
    </div>
  );
}
