import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from 'react';
import {
  MOBILE_MORE_CATEGORIES,
  MOBILE_RADIAL_CENTER,
  MOBILE_RADIAL_ORBIT,
  type MobileLayerSelectionId,
  type MobileMoreCategoryId,
  type MobileRadialActionId,
} from './mobileCommandCenterData';
import styles from './mobileMapControls.module.css';

const SWIPE_CLOSE_THRESHOLD_PX = 72;

export interface MobileCommandCenterPanelProps {
  open: boolean;
  onClose: () => void;
  onLayerSelect?: (id: MobileLayerSelectionId) => void;
}

function MobileCommandCenterPanelInner({
  open,
  onClose,
  onLayerSelect,
}: MobileCommandCenterPanelProps) {
  const [activeRadial, setActiveRadial] = useState<MobileRadialActionId>('map');
  const [activeMore, setActiveMore] = useState<MobileMoreCategoryId | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setMoreOpen(false);
      setToast(null);
    }
  }, [open]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const stopMapPropagation = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);

  const flashPress = useCallback((id: string) => {
    setPressedId(id);
    window.setTimeout(() => setPressedId((current) => (current === id ? null : current)), 240);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const handleSwipeStart = (event: TouchEvent<HTMLElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleSwipeEnd = (event: TouchEvent<HTMLElement>, closeAll = true) => {
    const startY = touchStartYRef.current;
    const endY = event.changedTouches[0]?.clientY;
    touchStartYRef.current = null;
    if (startY == null || endY == null) return;
    if (endY - startY > SWIPE_CLOSE_THRESHOLD_PX) {
      if (closeAll || !moreOpen) {
        onClose();
      } else {
        setMoreOpen(false);
      }
    }
  };

  const handleRadialSelect = useCallback(
    (id: MobileRadialActionId, message: string) => {
      flashPress(`radial-${id}`);

      if (id === 'more') {
        setMoreOpen((current) => !current);
        setActiveRadial('more');
        showToast(message);
        return;
      }

      setActiveRadial(id);
      setActiveMore(null);
      showToast(message);

      if (id !== 'map') {
        onLayerSelect?.(id);
      }
    },
    [flashPress, onLayerSelect, showToast],
  );

  const handleMoreSelect = useCallback(
    (category: (typeof MOBILE_MORE_CATEGORIES)[number]) => {
      flashPress(`more-${category.id}`);
      setActiveMore(category.id);
      setActiveRadial('more');
      showToast(`${category.title} layer active`);
      onLayerSelect?.(category.layerId);
    },
    [flashPress, onLayerSelect, showToast],
  );

  const orbitAngleStyle = (angle: number): CSSProperties =>
    ({ '--orbit-angle': `${angle}deg` }) as CSSProperties;

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className={`${styles.radialBackdrop} ${styles.radialBackdropOpen}`}
        onClick={onClose}
        onTouchStart={handleSwipeStart}
        onTouchEnd={(event) => handleSwipeEnd(event, true)}
        aria-hidden={false}
      />

      <div
        className={`${styles.radialAnchor} ${styles.radialAnchorOpen}`}
        role="dialog"
        aria-modal="true"
        aria-label="Map command wheel"
        onClick={stopMapPropagation}
        onTouchStart={stopMapPropagation}
      >
        <div className={styles.radialGlow} aria-hidden />

        <div
          className={`${styles.radialHub} ${styles.radialHubOpen}`}
          onTouchStart={handleSwipeStart}
          onTouchEnd={(event) => handleSwipeEnd(event, true)}
        >
          <button
            type="button"
            className={`${styles.radialBtn} ${styles.radialCenter} ${
              activeRadial === MOBILE_RADIAL_CENTER.id ? styles.radialBtnActive : ''
            } ${pressedId === `radial-${MOBILE_RADIAL_CENTER.id}` ? styles.radialBtnPressed : ''}`}
            onClick={() => handleRadialSelect(MOBILE_RADIAL_CENTER.id, `${MOBILE_RADIAL_CENTER.label} view active`)}
            aria-pressed={activeRadial === MOBILE_RADIAL_CENTER.id}
            aria-label={MOBILE_RADIAL_CENTER.label}
          >
            <span className={styles.radialIcon} aria-hidden>
              {MOBILE_RADIAL_CENTER.icon}
            </span>
            <span className={styles.radialLabel}>{MOBILE_RADIAL_CENTER.label}</span>
          </button>

          {MOBILE_RADIAL_ORBIT.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`${styles.radialBtn} ${styles.radialOrbit} ${
                activeRadial === action.id ? styles.radialBtnActive : ''
              } ${action.id === 'more' && moreOpen ? styles.radialBtnMoreOpen : ''} ${
                pressedId === `radial-${action.id}` ? styles.radialBtnPressed : ''
              }`}
              style={orbitAngleStyle(action.angle)}
              onClick={() =>
                handleRadialSelect(
                  action.id,
                  action.layerId ? `${action.label} layer active` : `${action.label} selected`,
                )
              }
              aria-pressed={activeRadial === action.id}
              aria-expanded={action.id === 'more' ? moreOpen : undefined}
              aria-label={action.label}
            >
              <span className={styles.radialIcon} aria-hidden>
                {action.icon}
              </span>
              <span className={styles.radialLabel}>{action.label}</span>
            </button>
          ))}
        </div>

        {toast ? (
          <p className={styles.radialToast} role="status" aria-live="polite">
            {toast}
          </p>
        ) : null}
      </div>

      <div
        className={`${styles.moreSheet} ${moreOpen ? styles.moreSheetOpen : ''}`}
        role="region"
        aria-label="More business layers"
        aria-hidden={!moreOpen}
        onClick={stopMapPropagation}
        onTouchStart={stopMapPropagation}
      >
        <div
          className={styles.moreHandle}
          onTouchStart={handleSwipeStart}
          onTouchEnd={(event) => handleSwipeEnd(event, false)}
          aria-hidden
        >
          <span className={styles.moreHandleBar} />
        </div>

        <header className={styles.moreHeader}>
          <h3 className={styles.moreTitle}>Business layers</h3>
          <p className={styles.moreSubtitle}>Explore the EuroBusinessHub ecosystem</p>
        </header>

        <div className={styles.moreBody}>
          <div className={styles.moreChipGrid}>
            {MOBILE_MORE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`${styles.moreChip} ${
                  activeMore === category.id ? styles.moreChipActive : ''
                } ${pressedId === `more-${category.id}` ? styles.moreChipPressed : ''}`}
                onClick={() => handleMoreSelect(category)}
                aria-pressed={activeMore === category.id}
              >
                <span className={styles.moreChipIcon} aria-hidden>
                  {category.icon}
                </span>
                <span className={styles.moreChipLabel}>{category.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const MobileCommandCenterPanel = memo(MobileCommandCenterPanelInner);
