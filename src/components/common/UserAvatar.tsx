import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ name, avatar, size = 'md' }: UserAvatarProps) {
  const initial = name?.charAt(0) || '?';
  const cls = [styles.avatar, size !== 'md' ? styles[size] : ''].filter(Boolean).join(' ');

  if (avatar) {
    return <div className={cls}><img className={styles.img} src={avatar} alt={name} /></div>;
  }
  return <div className={cls}>{initial}</div>;
}
