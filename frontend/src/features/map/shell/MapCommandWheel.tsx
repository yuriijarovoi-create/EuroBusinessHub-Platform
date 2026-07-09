import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import styles from './BusinessOperatingMap.module.css';

type ControlButtonId = 'map' | 'layers' | 'transport' | 'jobs' | 'companies' | 'warehouses' | 'ai';

interface OrbitButton {
  id: Exclude<ControlButtonId, 'map'>;
  icon: string;
  label: string;
  angle: number;
  toast: string;
}

const CENTER_BUTTON = {
  id: 'map' as const,
  icon: '🌍',
  label: 'Map',
  toast: 'Map view active',
};

const ORBIT_BUTTONS: OrbitButton[] = [
  { id: 'layers', icon: '🗺', label: 'Layers', angle: -90, toast: 'Layer manager coming soon' },
  { id: 'transport', icon: '🚚', label: 'Transport', angle: -30, toast: 'Transport selected' },
  { id: 'jobs', icon: '💼', label: 'Jobs', angle: 30, toast: 'Jobs selected' },
  { id: 'companies', icon: '🏢', label: 'Companies', angle: 90, toast: 'Companies selected' },
  { id: 'warehouses', icon: '📦', label: 'Warehouses', angle: 150, toast: 'Warehouses selected' },
  { id: 'ai', icon: '🤖', label: 'AI', angle: 210, toast: 'AI Map Assistant coming soon' },
];

export function MapCommandWheel() {
  const [activeId, setActiveId] = useState<ControlButtonId>('map');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSelect = useCallback((id: ControlButtonId, message: string) => {
    setActiveId(id);
    setToast(message);
  }, []);

  const orbitStyle = (angle: number): CSSProperties =>
    ({ '--orbit-angle': `${angle}deg` }) as CSSProperties;

  return (
    <section className={styles.mapCommandCenter} aria-label="Map control center">
      <span className={styles.mapCommandEyebrow}>Map control center</span>

      <div className={styles.commandWheelWrap}>
        <div className={styles.commandWheelGlow} aria-hidden="true" />

        <div className={styles.commandWheel} role="toolbar" aria-label="Map controls">
          <button
            type="button"
            className={`${styles.commandWheelBtn} ${styles.commandWheelCenter} ${
              activeId === CENTER_BUTTON.id ? styles.commandWheelBtnActive : ''
            }`}
            onClick={() => handleSelect(CENTER_BUTTON.id, CENTER_BUTTON.toast)}
            aria-pressed={activeId === CENTER_BUTTON.id}
            aria-label={CENTER_BUTTON.label}
          >
            <span className={styles.commandWheelIcon} aria-hidden="true">
              {CENTER_BUTTON.icon}
            </span>
            <span className={styles.commandWheelLabel}>{CENTER_BUTTON.label}</span>
          </button>

          {ORBIT_BUTTONS.map((button) => (
            <button
              key={button.id}
              type="button"
              className={`${styles.commandWheelBtn} ${styles.commandWheelOrbit} ${
                activeId === button.id ? styles.commandWheelBtnActive : ''
              }`}
              style={orbitStyle(button.angle)}
              onClick={() => handleSelect(button.id, button.toast)}
              aria-pressed={activeId === button.id}
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
  );
}
