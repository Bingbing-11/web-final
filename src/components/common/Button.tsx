import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export default function Button({ children, variant = 'primary', size = 'md', fullWidth, disabled, onClick, type = 'button' }: ButtonProps) {
  const cls = [
    styles.button,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : '',
  ].filter(Boolean).join(' ');

  return <button className={cls} onClick={onClick} disabled={disabled} type={type}>{children}</button>;
}
