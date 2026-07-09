import { useCallback } from 'react';
import styles from './mobileMapControls.module.css';

interface MobileAiPlaceholderModalProps {
  open: boolean;
  onClose: () => void;
}

export function MobileAiPlaceholderModal({ open, onClose }: MobileAiPlaceholderModalProps) {
  const stopMapPropagation = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <div
      className={`${styles.modalBackdrop} ${open ? styles.modalBackdropOpen : ''}`}
      onClick={onClose}
      onTouchStart={stopMapPropagation}
      role="presentation"
      aria-hidden={!open}
    >
      <div
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-ai-modal-title"
        onClick={stopMapPropagation}
        onTouchStart={stopMapPropagation}
      >
        <div className={styles.modalIcon} aria-hidden>
          🤖
        </div>
        <h3 id="mobile-ai-modal-title" className={styles.modalTitle}>
          AI Map Assistant
        </h3>
        <p className={styles.modalSubtitle}>Coming soon</p>
        <button type="button" className={styles.modalClose} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
