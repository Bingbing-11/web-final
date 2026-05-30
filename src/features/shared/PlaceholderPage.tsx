import { useNavigate } from 'react-router-dom';
import styles from './PlaceholderPage.module.css';

interface Props {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: Props) {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <span className={`material-symbols-outlined ${styles.icon}`}>construction</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.desc}>
          {description ?? '此页面正在建设中，敬请期待…'}
        </p>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          返回
        </button>
      </div>
    </div>
  );
}
