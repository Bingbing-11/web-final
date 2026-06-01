import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  open: boolean;
  icon: string;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, icon, title, message, confirmText, cancelText, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.icon}>{icon}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          {cancelText && <button className={styles.cancelBtn} onClick={onCancel}>{cancelText}</button>}
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
