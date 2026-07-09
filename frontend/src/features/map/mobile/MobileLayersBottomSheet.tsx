import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { MOBILE_LAYER_GROUPS } from './mobileLayerGroups';
import styles from './mobileMapControls.module.css';

const SWIPE_CLOSE_THRESHOLD_PX = 72;

interface MobileLayersBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileLayersBottomSheet({ open, onClose }: MobileLayersBottomSheetProps) {
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
            Map Layers
          </h2>
          <button
            type="button"
            className={styles.sheetClose}
            onClick={onClose}
            aria-label="Close layers panel"
          >
            ×
          </button>
        </div>

        <div className={styles.sheetBody}>
          {MOBILE_LAYER_GROUPS.map((group) => {
            const isOpen = Boolean(expandedGroups[group.id]);
            return (
              <section key={group.id} className={styles.group}>
                <button
                  type="button"
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                >
                  <span>{group.title}</span>
                  <span className={`${styles.groupChevron} ${isOpen ? styles.groupChevronOpen : ''}`}>
                    ▾
                  </span>
                </button>
                <div className={`${styles.groupBody} ${isOpen ? styles.groupBodyOpen : ''}`}>
                  <div className={styles.groupBodyInner}>
                    <div className={styles.chipGrid}>
                      {group.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={styles.chip}
                          aria-label={item}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {item}
                        </button>
                      ))}
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
