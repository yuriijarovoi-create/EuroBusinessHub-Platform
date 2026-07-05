import { useTranslation } from 'react-i18next';
import type { MapCityRecord } from '../types/mapTypes';
import styles from './EuropeBusinessMap.module.css';

interface CityTooltipProps {
  city: MapCityRecord;
  mapX: number;
  mapY: number;
}

export function CityTooltip({ city, mapX, mapY }: CityTooltipProps) {
  const { t } = useTranslation('map');

  return (
    <div
      className={styles.tooltip}
      style={{
        left: `${mapX}%`,
        top: `${mapY}%`,
      }}
      role="tooltip"
    >
      <strong className={styles.tooltipTitle}>{city.name}</strong>
      <span className={styles.tooltipCountry}>{city.country}</span>
      <div className={styles.tooltipGrid}>
        <span>{t('tooltip.companies', { count: city.metrics.companies })}</span>
        <span>{t('tooltip.jobs', { count: city.metrics.jobs })}</span>
        <span>{t('tooltip.warehouses', { count: city.metrics.warehouses })}</span>
        <span>{t('tooltip.transport', { count: city.metrics.transport })}</span>
      </div>
    </div>
  );
}
