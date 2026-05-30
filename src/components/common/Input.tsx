import styles from './Input.module.css';

interface InputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'textarea' | 'search';
  multiline?: boolean;
}

export default function Input({ value, onChange, placeholder, type = 'text', multiline }: InputProps) {
  if (multiline || type === 'textarea') {
    return <textarea className={`${styles.input} ${styles.textarea}`} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
  }
  return <input className={`${styles.input} ${type === 'search' ? styles.search : ''}`} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}
