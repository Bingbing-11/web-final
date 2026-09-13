import { IS_DEMO } from '../../config/env';
import styles from './DemoBadge.module.css';

/**
 * 演示模式标识
 * 当站点使用本地 Mock 数据运行时，在右下角显示一个轻量角标，
 * 说明「这是演示数据、无需登录即可浏览」——避免访客把演示数据误判为真实数据或坏数据。
 */
export default function DemoBadge() {
  if (!IS_DEMO) return null;
  return (
    <div className={styles.badge} title="本站使用本地演示数据，无需后端服务">
      <span className={styles.dot} />
      演示数据
    </div>
  );
}
