import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWorldStore } from '../../stores/useWorldStore';
import { WORLD_ICONS, WORLD_COLORS } from '../../lib/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './WorldCreate.module.css';

export default function WorldCreate() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState(WORLD_ICONS[0]);
  const [color, setColor] = useState(WORLD_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore(s => s.currentUser);
  const createWorld = useWorldStore(s => s.createWorld);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name || loading) return;
    setLoading(true);
    const world = await createWorld({ name, description: desc, ownerId: user!.id, icon, color, isSealed: false });
    setLoading(false);
    if (world) {
      navigate(`/world/${world.id}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.title}>创建新世界</div>
      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.label}>世界名称</span>
          <Input value={name} onChange={setName} placeholder="给世界取个名字" />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>描述</span>
          <Input value={desc} onChange={setDesc} placeholder="这个世界是关于什么的？" multiline />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>图标</span>
          <div className={styles.iconGrid}>
            {WORLD_ICONS.map(ic => (
              <div key={ic} className={`${styles.iconOption} ${icon === ic ? styles.selected : ''}`} onClick={() => setIcon(ic)}>{ic}</div>
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>颜色</span>
          <div className={styles.colorGrid}>
            {WORLD_COLORS.map(c => (
              <div key={c} className={`${styles.colorOption} ${color === c ? styles.selected : ''}`} style={{ '--color-bg': c } as React.CSSProperties} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <Button onClick={() => navigate(-1)} variant="secondary">取消</Button>
          <Button onClick={handleSubmit} fullWidth disabled={loading}>{loading ? '创建中...' : '创建世界'}</Button>
        </div>
      </div>
    </div>
  );
}
