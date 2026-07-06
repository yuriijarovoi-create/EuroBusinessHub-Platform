import { useTranslation } from 'react-i18next';
import type { MapLayerState } from '../types/mapTypes';
import styles from './EuropeBusinessMap.module.css';

interface LayerControlPanelProps {
  layers: MapLayerState;
  onChange: (next: MapLayerState) => void;
  open?: boolean;
  onClose?: () => void;
}

const TOGGLES: { key: keyof MapLayerState; labelKey: string }[] = [
  { key: 'routes', labelKey: 'layers.routes' },
  { key: 'road', labelKey: 'layers.road' },
  { key: 'rail', labelKey: 'layers.rail' },
  { key: 'air', labelKey: 'layers.air' },
  { key: 'sea', labelKey: 'layers.sea' },
  { key: 'river', labelKey: 'layers.river' },
  { key: 'companies', labelKey: 'layers.companies' },
  { key: 'jobs', labelKey: 'layers.jobs' },
  { key: 'warehouses', labelKey: 'layers.warehouses' },
];

export function LayerControlPanel({ layers, onChange, open = true, onClose }: LayerControlPanelProps) {
  const { t } = useTranslation('map');

  const toggle = (key: keyof MapLayerState) => {
    const next = { ...layers, [key]: !layers[key] };
    if (key === 'routes' && !next.routes) {
      onChange(next);
      return;
    }
    if (key !== 'routes' && !next.routes && (key === 'road' || key === 'rail' || key === 'air' || key === 'sea' || key === 'river')) {
      next.routes = true;
    }
    onChange(next);
  };

  return (
    <div className={`${styles.layerPanel} ${open ? styles.layerPanelOpen : ''}`}>
      <div className={styles.layerPanelHeader}>
        <span className={styles.layerTitle}>{t('layers.title')}</span>
        {onClose && (
          <button type="button" className={styles.layerClose} onClick={onClose} aria-label={t('panel.close')}>
            ×
          </button>
        )}
      </div>
      <div className={styles.layerGrid}>
        {TOGGLES.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            className={`${styles.layerToggle} ${layers[key] ? styles.layerOn : ''}`}
            onClick={() => toggle(key)}
            aria-pressed={layers[key]}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
