import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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
  getBusinessLayerLabel,
  isEuropeOverview,
  setMobileBusinessLayer,
  type ActiveMapContext,
  type BusinessLayerId,
} from '../utils/mapLayerContext';
import styles from './BusinessOperatingMap.module.css';

interface MapCommandWheelProps {
  activeMapContext: ActiveMapContext;
  onActiveMapContextChange: (context: ActiveMapContext) => void;
  onReturnToMainMap?: () => void;
}

interface DragOffset {
  x: number;
  y: number;
}

const VIEWPORT_MARGIN = 10;
const DRAG_THRESHOLD_PX = 8;

function clampDragOffset(offset: DragOffset, baseRect: DOMRect): DragOffset {
  const maxX = window.innerWidth - VIEWPORT_MARGIN - baseRect.right;
  const minX = VIEWPORT_MARGIN - baseRect.left;
  const maxY = window.innerHeight - VIEWPORT_MARGIN - baseRect.bottom;
  const minY = VIEWPORT_MARGIN - baseRect.top;

  return {
    x: Math.min(maxX, Math.max(minX, offset.x)),
    y: Math.min(maxY, Math.max(minY, offset.y)),
  };
}

export function MapCommandWheel({
  activeMapContext,
  onActiveMapContextChange,
  onReturnToMainMap,
}: MapCommandWheelProps) {
  const isMobileMapUi = useMobileMapUi();
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const panelRef = useRef<HTMLElement | null>(null);
  const baseRectRef = useRef<DOMRect | null>(null);
  const dragSessionRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const suppressClickRef = useRef(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isCommandCenterOpen) {
      setIsMoreOpen(false);
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      baseRectRef.current = null;
    }
  }, [isCommandCenterOpen]);

  useLayoutEffect(() => {
    if (!isCommandCenterOpen || !panelRef.current) return undefined;

    const captureBaseRect = () => {
      if (!panelRef.current) return;
      setDragOffset({ x: 0, y: 0 });
      baseRectRef.current = panelRef.current.getBoundingClientRect();
    };

    captureBaseRect();
    const frame = window.requestAnimationFrame(captureBaseRect);
    return () => window.cancelAnimationFrame(frame);
  }, [isCommandCenterOpen]);

  useEffect(() => {
    if (!statusToast) return undefined;
    const timer = window.setTimeout(() => setStatusToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [statusToast]);

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

  const activeLayerLabel = useMemo(() => {
    if (!activeMapContext.businessLayer) return null;
    return getBusinessLayerLabel(activeMapContext.businessLayer);
  }, [activeMapContext.businessLayer]);

  const panelDragStyle = useMemo(
    () =>
      ({
        '--panel-drag-x': `${dragOffset.x}px`,
        '--panel-drag-y': `${dragOffset.y}px`,
      }) as CSSProperties,
    [dragOffset],
  );

  const toggle = useCallback(() => {
    setIsCommandCenterOpen((current) => !current);
  }, []);

  const close = useCallback(() => {
    setIsCommandCenterOpen(false);
    setIsMoreOpen(false);
  }, []);

  const showStatus = useCallback((message: string) => {
    setStatusToast(message);
  }, []);

  const isDragTarget = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    if (target.closest(`.${styles.commandWheelBtn}`)) return false;
    return Boolean(
      target.closest(`.${styles.commandWheelDragHandle}`) ||
        target.closest(`.${styles.commandWheelPanel}`),
    );
  }, []);

  const handlePanelPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!isDragTarget(event.target)) return;

      const panel = panelRef.current;
      if (!panel) return;

      if (!baseRectRef.current) {
        baseRectRef.current = panel.getBoundingClientRect();
      }

      dragSessionRef.current = {
        active: true,
        moved: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: dragOffset.x,
        originY: dragOffset.y,
      };

      panel.setPointerCapture(event.pointerId);
    },
    [dragOffset.x, dragOffset.y, isDragTarget],
  );

  const handlePanelPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const session = dragSessionRef.current;
    if (!session.active || session.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;

    if (!session.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) return;

    session.moved = true;
    setIsDragging(true);

    const baseRect = baseRectRef.current;
    if (!baseRect) return;

    const nextOffset = clampDragOffset(
      { x: session.originX + deltaX, y: session.originY + deltaY },
      baseRect,
    );
    setDragOffset(nextOffset);
  }, []);

  const endPanelDrag = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const session = dragSessionRef.current;
    if (!session.active || session.pointerId !== event.pointerId) return;

    if (session.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    session.active = false;
    setIsDragging(false);

    if (panelRef.current?.hasPointerCapture(event.pointerId)) {
      panelRef.current.releasePointerCapture(event.pointerId);
    }
  }, []);

  const guardDragClick = useCallback((event: React.MouseEvent) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }, []);

  const activateLayer = useCallback(
    (layerId: BusinessLayerId, label: string) => {
      onReturnToMainMap?.();
      onActiveMapContextChange(setMobileBusinessLayer(layerId));
      showStatus(`${label} layer active`);
      close();
    },
    [close, onActiveMapContextChange, onReturnToMainMap, showStatus],
  );

  const handleMapFocus = useCallback(() => {
    onReturnToMainMap?.();
    onActiveMapContextChange(DEFAULT_ACTIVE_MAP_CONTEXT);
    setIsMoreOpen(false);
    showStatus('Europe overview active');
    close();
  }, [close, onActiveMapContextChange, onReturnToMainMap, showStatus]);

  const handleRadialSelect = useCallback(
    (id: MobileRadialOrbitId) => {
      if (id === 'more') {
        setIsMoreOpen((current) => !current);
        showStatus('More business layers');
        return;
      }

      if (id === 'ai') {
        onReturnToMainMap?.();
        onActiveMapContextChange(setMobileBusinessLayer('ai'));
        showStatus('AI Map Assistant coming soon');
        close();
        return;
      }

      const action = MOBILE_RADIAL_ORBIT.find((entry) => entry.id === id);
      if (!action?.layerId) return;

      setIsMoreOpen(false);
      activateLayer(action.layerId, action.label);
    },
    [activateLayer, close, onActiveMapContextChange, onReturnToMainMap, showStatus],
  );

  const handleMoreCategory = useCallback(
    (layerId: BusinessLayerId, title: string) => {
      activateLayer(layerId, title);
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
      {activeLayerLabel ? (
        <div className={styles.mobileActiveLayerBadge} role="status" aria-live="polite">
          <span className={styles.mobileActiveLayerBadgeLabel}>Active layer:</span>
          <span className={styles.mobileActiveLayerBadgeValue}>{activeLayerLabel}</span>
        </div>
      ) : null}

      {statusToast ? (
        <p className={styles.mobileLayerStatusToast} role="status" aria-live="polite">
          {statusToast}
        </p>
      ) : null}

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
            ref={panelRef}
            className={`${styles.commandWheelPanel} ${styles.commandWheelPanelOpen} ${
              isDragging ? styles.commandWheelPanelDragging : ''
            }`}
            style={panelDragStyle}
            aria-label="Map control center"
            onClick={(event) => event.stopPropagation()}
            onClickCapture={guardDragClick}
            onPointerDown={handlePanelPointerDown}
            onPointerMove={handlePanelPointerMove}
            onPointerUp={endPanelDrag}
            onPointerCancel={endPanelDrag}
          >
            <div className={styles.commandWheelDragHandle} aria-hidden="true">
              <span className={styles.commandWheelDragHandleBar} />
              <span className={styles.commandWheelDragHandleDots}>⋮⋮</span>
            </div>

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
