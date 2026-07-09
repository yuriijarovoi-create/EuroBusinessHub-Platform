import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MobileAiPlaceholderModal } from './MobileAiPlaceholderModal';
import { MobileLayersBottomSheet } from './MobileLayersBottomSheet';
import { useMobileMapUi } from './useMobileMapUi';
import styles from './mobileMapControls.module.css';

interface MobileMapControlCenterProps {
  /** When false the control center is not mounted (e.g. workspace view). */
  enabled?: boolean;
}

export function MobileMapControlCenter({ enabled = true }: MobileMapControlCenterProps) {
  const isMobileMapUi = useMobileMapUi();
  const [layersOpen, setLayersOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const stopMapPropagation = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);

  if (!enabled || !isMobileMapUi || !portalReady || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={styles.root} aria-hidden={false}>
      <div className={styles.fabStack}>
        <button
          type="button"
          className={`${styles.fab} ${styles.fabAi}`}
          onClick={(event) => {
            stopMapPropagation(event);
            setAiOpen(true);
          }}
          onTouchStart={stopMapPropagation}
          onMouseDown={stopMapPropagation}
          aria-label="AI Map Assistant"
        >
          <span className={styles.fabIcon} aria-hidden>
            🤖
          </span>
          <span>AI</span>
        </button>

        <button
          type="button"
          className={styles.fab}
          onClick={(event) => {
            stopMapPropagation(event);
            setLayersOpen(true);
          }}
          onTouchStart={stopMapPropagation}
          onMouseDown={stopMapPropagation}
          aria-label="Open map layers"
          aria-expanded={layersOpen}
        >
          <span className={styles.fabIcon} aria-hidden>
            🗺
          </span>
          <span>Layers</span>
        </button>
      </div>

      <MobileLayersBottomSheet open={layersOpen} onClose={() => setLayersOpen(false)} />
      <MobileAiPlaceholderModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>,
    document.body,
  );
}
