import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MobileCommandCenterPanel } from './MobileCommandCenterPanel';
import type { MobileLayerSelectionId } from './mobileCommandCenterData';
import { useMobileMapUi } from './useMobileMapUi';
import styles from './mobileMapControls.module.css';

interface MobileMapControlCenterProps {
  /** When false the control center is not mounted (e.g. workspace view). */
  enabled?: boolean;
  /** Future hook for map layer activation — no backend wiring yet. */
  onLayerSelect?: (layerId: MobileLayerSelectionId) => void;
}

export function MobileMapControlCenter({
  enabled = true,
  onLayerSelect,
}: MobileMapControlCenterProps) {
  const { t } = useTranslation('map');
  const isMobileMapUi = useMobileMapUi();
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const stopMapPropagation = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);

  const toggle = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  if (!enabled || !isMobileMapUi || !portalReady || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={styles.root} aria-hidden={false}>
      <button
        type="button"
        className={`${styles.fabMain} ${open ? styles.fabMainOpen : ''}`}
        onClick={(event) => {
          stopMapPropagation(event);
          toggle();
        }}
        onTouchStart={stopMapPropagation}
        onMouseDown={stopMapPropagation}
        aria-label={t('mobile.commandCenter')}
        aria-expanded={open}
      >
        <span className={styles.fabMainIcon} aria-hidden>
          🗺
        </span>
        <span className={styles.fabMainLabel}>{t('mobile.map')}</span>
      </button>

      {open ? (
        <MobileCommandCenterPanel open={open} onClose={close} onLayerSelect={onLayerSelect} />
      ) : null}
    </div>,
    document.body,
  );
}
