import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './mobileMapControls.module.css';

const SWIPE_CLOSE_THRESHOLD_PX = 72;

const LAYER_GROUP_CONFIG = [
  { id: 'transport', items: ['road', 'rail', 'air', 'sea', 'river'] as const },
  { id: 'business', items: ['marketplace', 'companies', 'jobs', 'warehouses', 'partners'] as const },
  { id: 'services', items: ['legal', 'finance', 'medical', 'education', 'technology'] as const },
  { id: 'industries', items: ['agriculture', 'manufacturing', 'construction', 'tourism'] as const },
  { id: 'innovation', items: ['ai', 'startups', 'digitalProducts', 'academy', 'investments'] as const },
] as const;

interface MobileLayersBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileLayersBottomSheet({ open, onClose }: MobileLayersBottomSheetProps) {
  const { t } = useTranslation('map');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    transport: true,
  });
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startY = touchStartYRef.current;
    const endY = event.changedTouches[0]?.clientY;
    touchStartYRef.current = null;
    if (startY == null || endY == null) return;
    if (endY - startY > SWIPE_CLOSE_THRESHOLD_PX) {
      onClose();
    }
  };

  const stopMapPropagation = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={onClose}
        onTouchStart={stopMapPropagation}
        aria-hidden={!open}
      />
      <div
        className={`${styles.sheet} ${open ? styles.sheetOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-layers-sheet-title"
        aria-hidden={!open}
        onClick={stopMapPropagation}
        onTouchStart={stopMapPropagation}
      >
        <div
          className={styles.sheetHandle}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-hidden
        >
          <span className={styles.sheetHandleBar} />
        </div>

        <div className={styles.sheetHeader}>
          <h2 id="mobile-layers-sheet-title" className={styles.sheetTitle}>
            {t('mobile.businessLayers')}
          </h2>
          <button
            type="button"
            className={styles.sheetClose}
            onClick={onClose}
            aria-label={t('mobile.closeLayersPanel')}
          >
            ×
          </button>
        </div>

        <div className={styles.sheetBody}>
          {LAYER_GROUP_CONFIG.map((group) => {
            const isOpen = Boolean(expandedGroups[group.id]);
            return (
              <section key={group.id} className={styles.group}>
                <button
                  type="button"
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                >
                  <span>{t(`mobile.layerGroups.${group.id}.title`)}</span>
                  <span className={`${styles.groupChevron} ${isOpen ? styles.groupChevronOpen : ''}`}>
                    ▾
                  </span>
                </button>
                <div className={`${styles.groupBody} ${isOpen ? styles.groupBodyOpen : ''}`}>
                  <div className={styles.groupBodyInner}>
                    <div className={styles.chipGrid}>
                      {group.items.map((item) => {
                        const label = t(`mobile.layerGroups.${group.id}.${item}`);
                        return (
                          <button
                            key={item}
                            type="button"
                            className={styles.chip}
                            aria-label={label}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
