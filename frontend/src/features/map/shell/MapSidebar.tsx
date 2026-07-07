import { useState, type CSSProperties, type MouseEvent, type TouchEvent } from 'react';
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

type LogisticsButtonId = 'road' | 'rail' | 'sea' | 'air' | 'river';

type BusinessButtonId = keyof Pick<
  BusinessFilterState,
  | 'marketplace'
  | 'transport'
  | 'companies'
  | 'jobs'
  | 'warehouses'
  | 'businessServices'
  | 'partners'
  | 'academy'
  | 'digitalProducts'
  | 'ai'
  | 'events'
  | 'investments'
  | 'startups'
  | 'manufacturing'
  | 'agriculture'
  | 'construction'
  | 'medical'
  | 'tourism'
  | 'technology'
  | 'finance'
  | 'legal'
  | 'education'
>;

const TRANSPORT_TOGGLES: Array<{ id: LogisticsButtonId; label: string; color: string }> = [
  { id: 'road', label: 'Road transport', color: '#3b8ede' },
  { id: 'rail', label: 'Rail', color: '#34c759' },
  { id: 'sea', label: 'Sea freight', color: '#ff8c42' },
  { id: 'air', label: 'Air cargo', color: '#a78bfa' },
  { id: 'river', label: 'River', color: '#22d3ee' },
];

const BUSINESS_TOGGLES: Array<{ id: BusinessButtonId; label: string }> = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'transport', label: 'Transport' },
  { id: 'companies', label: 'Companies' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'warehouses', label: 'Warehouses' },
  { id: 'businessServices', label: 'Business Services' },
  { id: 'partners', label: 'Partners' },
  { id: 'academy', label: 'Academy' },
  { id: 'digitalProducts', label: 'Digital Products' },
  { id: 'ai', label: 'AI' },
  { id: 'events', label: 'Events' },
  { id: 'investments', label: 'Investments' },
  { id: 'startups', label: 'Startups' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'construction', label: 'Construction' },
  { id: 'medical', label: 'Medical' },
  { id: 'tourism', label: 'Tourism' },
  { id: 'technology', label: 'Technology' },
  { id: 'finance', label: 'Finance' },
  { id: 'legal', label: 'Legal' },
  { id: 'education', label: 'Education' },
];

function stopChipPointerEvent(event: MouseEvent | TouchEvent): void {
  event.stopPropagation();
}

export function MapSidebar({
  layers: _layers,
  businessFilters: _businessFilters,
  onLayersChange: _onLayersChange,
  onBusinessFiltersChange: _onBusinessFiltersChange,
  collapsed = false,
  onToggle,
}: MapSidebarProps) {
  const { t } = useTranslation('map');
  const [activeLogisticsId, setActiveLogisticsId] = useState<LogisticsButtonId | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<BusinessButtonId | null>(null);

  const toggleLogistics = (id: LogisticsButtonId) => {
    setActiveLogisticsId((current) => (current === id ? null : id));
  };

  const toggleBusiness = (id: BusinessButtonId) => {
    setActiveBusinessId((current) => (current === id ? null : id));
  };

  return (
    <aside
      className={`${styles.sidebar} ${styles.sidebarLeft} ${collapsed ? styles.sidebarCollapsed : ''}`}
      aria-label={t('layers.title')}
      onMouseDown={stopChipPointerEvent}
      onTouchStart={stopChipPointerEvent}
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
          {TRANSPORT_TOGGLES.map(({ id, label, color }) => {
            const isActive = activeLogisticsId === id;
            return (
              <button
                key={id}
                type="button"
                className={`${styles.filterChip} ${isActive ? styles.filterChipOn : ''}`}
                style={{ '--chip-accent': color } as CSSProperties}
                onClick={() => toggleLogistics(id)}
                onMouseDown={stopChipPointerEvent}
                onTouchStart={stopChipPointerEvent}
                aria-pressed={isActive}
              >
                <span className={styles.filterDot} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.sidebarSection}>
        <span className={styles.sidebarEyebrow}>{t('operating.business', { defaultValue: 'Business modules' })}</span>
        <div className={styles.filterGrid}>
          {BUSINESS_TOGGLES.map(({ id, label }) => {
            const isActive = activeBusinessId === id;
            return (
              <button
                key={id}
                type="button"
                className={`${styles.filterChip} ${isActive ? styles.filterChipOn : ''}`}
                onClick={() => toggleBusiness(id)}
                onMouseDown={stopChipPointerEvent}
                onTouchStart={stopChipPointerEvent}
                aria-pressed={isActive}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
