import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorldStore } from '../../stores/useWorldStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './WorldSettings.module.css';

export default function WorldSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const world = useWorldStore(s => s.getWorld(id || ''));
  const updateWorld = useWorldStore(s => s.updateWorld);
  const sealWorld = useWorldStore(s => s.sealWorld);
  const [name, setName] = useState(world?.name || '');
  const [desc, setDesc] = useState(world?.description || '');

  if (!world) return <div>世界不存在</div>;

  const handleSave = async () => { await updateWorld(world.id, { name, description: desc }); navigate(-1); };
  const handleSeal = async () => { await sealWorld(world.id); navigate(-1); };

  return (
    <div className={styles.page}>
      <div className={styles.title}>世界设置</div>
      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.label}>名称</span>
          <Input value={name} onChange={setName} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>描述</span>
          <Input value={desc} onChange={setDesc} multiline />
        </div>
        <Button onClick={handleSave} fullWidth>保存</Button>
      </div>
      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>封存世界</div>
        <div className={styles.dangerDesc}>封存后无法再添加日记，水晶球将冻结为记忆标本。</div>
        <Button variant="danger" onClick={handleSeal}>封存此世界</Button>
      </div>
    </div>
  );
}
