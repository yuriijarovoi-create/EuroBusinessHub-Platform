import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './mobileMapControls.module.css';

interface MobileAiPlaceholderModalProps {
  open: boolean;
  onClose: () => void;
}

export function MobileAiPlaceholderModal({ open, onClose }: MobileAiPlaceholderModalProps) {
  const { t } = useTranslation('map');
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
          {t('mobile.aiAssistantTitle')}
        </h3>
        <p className={styles.modalSubtitle}>{t('mobile.comingSoon')}</p>
        <button type="button" className={styles.modalClose} onClick={onClose}>
          {t('mobile.close')}
        </button>
      </div>
    </div>
  );
}
