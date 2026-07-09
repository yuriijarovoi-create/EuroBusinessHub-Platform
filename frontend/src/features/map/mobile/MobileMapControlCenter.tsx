import { useCallback, useState, type CSSProperties } from 'react';
import { MobileAiPlaceholderModal } from './MobileAiPlaceholderModal';
import { MobileLayersBottomSheet } from './MobileLayersBottomSheet';
import { useMobileMapUi } from './useMobileMapUi';
import styles from './mobileMapControls.module.css';

const ORBIT_COMMANDS = [
  { id: 'layers', icon: '🗺', label: 'Layers', action: 'layers' as const },
  { id: 'transport', icon: '🚚', label: 'Transport', action: 'placeholder' as const },
  { id: 'jobs', icon: '💼', label: 'Jobs', action: 'placeholder' as const },
  { id: 'companies', icon: '🏢', label: 'Companies', action: 'placeholder' as const },
  { id: 'warehouses', icon: '📦', label: 'Warehouses', action: 'placeholder' as const },
];

const ORBIT_START_DEG = -90;
const ORBIT_STEP_DEG = 72;

interface MobileMapControlCenterProps {
  /** Reserved for route gating; activity dock is only visible on the map view. */
  enabled?: boolean;
}

export function MobileMapControlCenter({ enabled = true }: MobileMapControlCenterProps) {
  const isMobileMapUi = useMobileMapUi();
  const [layersOpen, setLayersOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const handleOrbitPress = useCallback((action: (typeof ORBIT_COMMANDS)[number]['action']) => {
    if (action === 'layers') {
      setLayersOpen(true);
    }
  }, []);

  if (!enabled || !isMobileMapUi) {
    return null;
  }

  return (
    <>
      <section className={styles.commandSection} aria-label="Map Control Center">
        <h3 className={styles.sectionTitle}>Map Control Center</h3>

        <div className={styles.wheelViewport}>
          <div className={styles.wheel}>
            <button
              type="button"
              className={styles.wheelCenter}
              onClick={() => setAiOpen(true)}
              aria-label="AI Map Assistant"
            >
              <span className={styles.wheelCenterIcon} aria-hidden>
                🤖
              </span>
              <span className={styles.wheelCenterLabel}>AI</span>
            </button>

            {ORBIT_COMMANDS.map((command, index) => {
              const angle = ORBIT_START_DEG + ORBIT_STEP_DEG * index;
              return (
                <button
                  key={command.id}
                  type="button"
                  className={styles.wheelOrbit}
                  style={{ '--orbit-angle': `${angle}deg` } as CSSProperties}
                  onClick={() => handleOrbitPress(command.action)}
                  aria-label={command.label}
                >
                  <span className={styles.wheelOrbitIcon} aria-hidden>
                    {command.icon}
                  </span>
                  <span className={styles.wheelOrbitLabel}>{command.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <MobileLayersBottomSheet open={layersOpen} onClose={() => setLayersOpen(false)} />
      <MobileAiPlaceholderModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}
