import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import type { BusinessFilterState } from '../engine/types';
import type { MapLayerState } from '../types/mapTypes';
import styles from './BusinessOperatingMap.module.css';

interface MapSidebarProps {
  layers: MapLayerState;
  businessFilters: BusinessFilterState;
  onLayersChange: (layers: MapLayerState) => void;
  onBusinessFiltersChange: (filters: Partial<BusinessFilterState>) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

const TRANSPORT_TOGGLES: Array<{ key: keyof MapLayerState; label: string; color: string }> = [
  { key: 'road', label: 'Road transport', color: '#3b8ede' },
  { key: 'rail', label: 'Rail', color: '#34c759' },
  { key: 'sea', label: 'Sea freight', color: '#ff8c42' },
  { key: 'air', label: 'Air cargo', color: '#a78bfa' },
  { key: 'river', label: 'River', color: '#22d3ee' },
];

const BUSINESS_TOGGLES: Array<{ key: keyof BusinessFilterState; label: string }> = [
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'transport', label: 'Transport' },
  { key: 'companies', label: 'Companies' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'warehouses', label: 'Warehouses' },
  { key: 'businessServices', label: 'Business Services' },
  { key: 'partners', label: 'Partners' },
  { key: 'academy', label: 'Academy' },
  { key: 'digitalProducts', label: 'Digital Products' },
  { key: 'ai', label: 'AI' },
  { key: 'events', label: 'Events' },
  { key: 'investments', label: 'Investments' },
  { key: 'startups', label: 'Startups' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'construction', label: 'Construction' },
  { key: 'medical', label: 'Medical' },
  { key: 'tourism', label: 'Tourism' },
  { key: 'technology', label: 'Technology' },
  { key: 'finance', label: 'Finance' },
  { key: 'legal', label: 'Legal' },
  { key: 'education', label: 'Education' },
];

export function MapSidebar({
  layers,
  businessFilters,
  onLayersChange,
  onBusinessFiltersChange,
  collapsed = false,
  onToggle,
}: MapSidebarProps) {
  const { t } = useTranslation('map');

  const toggleLayer = (key: keyof MapLayerState) => {
    onLayersChange({ ...layers, [key]: !layers[key] });
  };

  const toggleBusiness = (key: keyof BusinessFilterState) => {
    onBusinessFiltersChange({ [key]: !businessFilters[key] });
  };

  return (
    <aside
      className={`${styles.sidebar} ${styles.sidebarLeft} ${collapsed ? styles.sidebarCollapsed : ''}`}
      aria-label={t('layers.title')}
    >
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>{t('operating.filters', { defaultValue: 'Filters' })}</span>
        {onToggle && (
          <button type="button" className={styles.sidebarToggle} onClick={onToggle} aria-label="Toggle filters">
            ‹
          </button>
        )}
      </div>

      <div className={styles.sidebarSection}>
        <span className={styles.sidebarEyebrow}>{t('operating.logistics', { defaultValue: 'Logistics' })}</span>
        <div className={styles.filterGrid}>
          {TRANSPORT_TOGGLES.map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              className={`${styles.filterChip} ${layers[key] ? styles.filterChipOn : ''}`}
              style={{ '--chip-accent': color } as CSSProperties}
              onClick={() => toggleLayer(key)}
              aria-pressed={layers[key]}
            >
              <span className={styles.filterDot} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sidebarSection}>
        <span className={styles.sidebarEyebrow}>{t('operating.business', { defaultValue: 'Business modules' })}</span>
        <div className={styles.filterGrid}>
          {BUSINESS_TOGGLES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`${styles.filterChip} ${businessFilters[key] ? styles.filterChipOn : ''}`}
              onClick={() => toggleBusiness(key)}
              aria-pressed={businessFilters[key]}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
