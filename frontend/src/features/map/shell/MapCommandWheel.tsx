import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  MOBILE_MORE_CATEGORIES,
  MOBILE_MORE_LAYER_IDS,
  MOBILE_RADIAL_CENTER,
  MOBILE_RADIAL_ORBIT,
  type MobileRadialActionId,
  type MobileRadialOrbitId,
} from '../mobile/mobileCommandCenterData';
import { useMobileMapUi } from '../mobile/useMobileMapUi';
import {
  DEFAULT_ACTIVE_MAP_CONTEXT,
  isEuropeOverview,
  setBusinessLayer,
  type ActiveMapContext,
  type BusinessLayerId,
} from '../utils/mapLayerContext';
import styles from './BusinessOperatingMap.module.css';

interface MapCommandWheelProps {
  activeMapContext: ActiveMapContext;
  onActiveMapContextChange: (context: ActiveMapContext) => void;
}

export function MapCommandWheel({
  activeMapContext,
  onActiveMapContextChange,
}: MapCommandWheelProps) {
  const isMobileMapUi = useMobileMapUi();
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isCommandCenterOpen) {
      setIsMoreOpen(false);
    }
  }, [isCommandCenterOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isCommandCenterOpen || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isCommandCenterOpen]);

  const activeRadialId = useMemo((): MobileRadialActionId => {
    const { businessLayer } = activeMapContext;
    if (!businessLayer) return 'map';
    if (businessLayer === 'transport') return 'transport';
    if (businessLayer === 'jobs') return 'jobs';
    if (businessLayer === 'companies') return 'companies';
    if (businessLayer === 'warehouses') return 'warehouses';
    if (businessLayer === 'ai') return 'ai';
    if (MOBILE_MORE_LAYER_IDS.has(businessLayer)) return 'more';
    return 'map';
  }, [activeMapContext]);

  const toggle = useCallback(() => {
    setIsCommandCenterOpen((current) => !current);
  }, []);

  const close = useCallback(() => {
    setIsCommandCenterOpen(false);
    setIsMoreOpen(false);
  }, []);

  const showStatus = useCallback((message: string) => {
    setToast(message);
  }, []);

  const activateLayer = useCallback(
    (layerId: BusinessLayerId, label: string) => {
      onActiveMapContextChange(setBusinessLayer(activeMapContext, layerId));
      showStatus(`${label} layer active`);
    },
    [activeMapContext, onActiveMapContextChange, showStatus],
  );

  const handleMapFocus = useCallback(() => {
    onActiveMapContextChange(DEFAULT_ACTIVE_MAP_CONTEXT);
    setIsMoreOpen(false);
    close();
  }, [close, onActiveMapContextChange]);

  const handleRadialSelect = useCallback(
    (id: MobileRadialOrbitId) => {
      if (id === 'more') {
        setIsMoreOpen((current) => !current);
        showStatus('More business layers');
        return;
      }

      if (id === 'ai') {
        showStatus('AI Map Assistant coming soon');
        return;
      }

      const action = MOBILE_RADIAL_ORBIT.find((entry) => entry.id === id);
      if (!action?.layerId) return;

      setIsMoreOpen(false);
      activateLayer(action.layerId, action.label);
    },
    [activateLayer, showStatus],
  );

  const handleMoreCategory = useCallback(
    (layerId: BusinessLayerId, title: string) => {
      activateLayer(layerId, title);
      setIsMoreOpen(true);
    },
    [activateLayer],
  );

  const orbitStyle = (angle: number): CSSProperties =>
    ({ '--orbit-angle': `${angle}deg` }) as CSSProperties;

  if (!isMobileMapUi || !portalReady || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={styles.mapCommandPortal} aria-hidden={false}>
      <button
        type="button"
        className={`${styles.commandWheelFab} ${isCommandCenterOpen ? styles.commandWheelFabOpen : ''}`}
        onClick={toggle}
        aria-label="Map control center"
        aria-expanded={isCommandCenterOpen}
      >
        <span className={styles.commandWheelFabIcon} aria-hidden="true">
          🎛
        </span>
        <span className={styles.commandWheelFabLabel}>Map Control</span>
      </button>

      {isCommandCenterOpen ? (
        <>
          <div
            className={`${styles.commandWheelBackdrop} ${styles.commandWheelBackdropOpen}`}
            onClick={close}
            aria-hidden={false}
          />

          <section
            className={`${styles.commandWheelPanel} ${styles.commandWheelPanelOpen}`}
            aria-label="Map control center"
            onClick={(event) => event.stopPropagation()}
          >
            <span className={styles.mapCommandEyebrow}>Map control center</span>

            <div className={styles.commandWheelWrap}>
              <div className={styles.commandWheelGlow} aria-hidden="true" />

              <div className={styles.commandWheel} role="toolbar" aria-label="Map controls">
                <button
                  type="button"
                  className={`${styles.commandWheelBtn} ${styles.commandWheelCenter} ${
                    isEuropeOverview(activeMapContext) ? styles.commandWheelBtnActive : ''
                  }`}
                  onClick={handleMapFocus}
                  aria-pressed={isEuropeOverview(activeMapContext)}
                  aria-label={MOBILE_RADIAL_CENTER.label}
                >
                  <span className={styles.commandWheelIcon} aria-hidden="true">
                    {MOBILE_RADIAL_CENTER.icon}
                  </span>
                  <span className={styles.commandWheelLabel}>{MOBILE_RADIAL_CENTER.label}</span>
                </button>

                {MOBILE_RADIAL_ORBIT.map((button) => (
                  <button
                    key={button.id}
                    type="button"
                    className={`${styles.commandWheelBtn} ${styles.commandWheelOrbit} ${
                      activeRadialId === button.id ? styles.commandWheelBtnActive : ''
                    } ${button.id === 'more' && isMoreOpen ? styles.commandWheelBtnMoreOpen : ''}`}
                    style={orbitStyle(button.angle)}
                    onClick={() => handleRadialSelect(button.id)}
                    aria-pressed={activeRadialId === button.id}
                    aria-expanded={button.id === 'more' ? isMoreOpen : undefined}
                    aria-label={button.label}
                  >
                    <span className={styles.commandWheelIcon} aria-hidden="true">
                      {button.icon}
                    </span>
                    <span className={styles.commandWheelLabel}>{button.label}</span>
                  </button>
                ))}
              </div>

              {toast ? (
                <p className={styles.commandWheelToast} role="status" aria-live="polite">
                  {toast}
                </p>
              ) : null}
            </div>
          </section>

          <div
            className={`${styles.commandMoreSheet} ${isMoreOpen ? styles.commandMoreSheetOpen : ''}`}
            role="region"
            aria-label="More business layers"
            aria-hidden={!isMoreOpen}
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.commandMoreHeader}>
              <h3 className={styles.commandMoreTitle}>Business layers</h3>
            </header>

            <div className={styles.commandMoreBody}>
              <div className={styles.commandMoreChipGrid}>
                {MOBILE_MORE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`${styles.commandMoreChip} ${
                      activeMapContext.businessLayer === category.layerId
                        ? styles.commandMoreChipActive
                        : ''
                    }`}
                    onClick={() => handleMoreCategory(category.layerId, category.title)}
                    aria-pressed={activeMapContext.businessLayer === category.layerId}
                  >
                    <span className={styles.commandMoreChipIcon} aria-hidden="true">
                      {category.icon}
                    </span>
                    <span className={styles.commandMoreChipLabel}>{category.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>,
    document.body,
  );
}
