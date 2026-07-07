import { type CSSProperties, type MouseEvent, type TouchEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BUSINESS_LAYER_OPTIONS,
  LOGISTICS_LAYER_OPTIONS,
  toggleBusinessLayer,
  toggleLogisticsLayer,
  type ActiveMapContext,
  type BusinessLayerId,
  type LogisticsLayerId,
} from '../utils/mapLayerContext';
import styles from './BusinessOperatingMap.module.css';

interface MapSidebarProps {
  activeMapContext: ActiveMapContext;
  onActiveMapContextChange: (context: ActiveMapContext) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

function stopChipPointerEvent(event: MouseEvent | TouchEvent): void {
  event.stopPropagation();
}

export function MapSidebar({
  activeMapContext,
  onActiveMapContextChange,
  collapsed = false,
  onToggle,
}: MapSidebarProps) {
  const { t } = useTranslation('map');

  const toggleLogistics = (id: LogisticsLayerId) => {
    onActiveMapContextChange(toggleLogisticsLayer(activeMapContext, id));
  };

  const toggleBusiness = (id: BusinessLayerId) => {
    onActiveMapContextChange(toggleBusinessLayer(activeMapContext, id));
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
          {LOGISTICS_LAYER_OPTIONS.map(({ id, label, color }) => {
            const isActive = activeMapContext.logisticsLayer === id;
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
          {BUSINESS_LAYER_OPTIONS.map(({ id, label }) => {
            const isActive = activeMapContext.businessLayer === id;
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
