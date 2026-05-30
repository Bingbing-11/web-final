import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import styles from './GuidePage.module.css';

export default function GuidePage() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.emoji}>🔮</div>
        <div className={styles.title}>欢迎来到私域小世界</div>
        <div className={styles.desc}>
          一个只属于你的私密记录空间。
          每一篇日记都将化作水晶球中独特的一抹色彩。
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepIcon}>🌍</span>
            <span className={styles.stepText}>创建世界</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>📝</span>
            <span className={styles.stepText}>记录心情</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>🔮</span>
            <span className={styles.stepText}>养成水晶</span>
          </div>
        </div>
        <Button onClick={() => navigate('/login')}>开始使用</Button>
      </div>
    </div>
  );
}
