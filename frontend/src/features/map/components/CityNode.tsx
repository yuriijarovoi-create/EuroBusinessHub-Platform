import { memo } from 'react';
import type { MapCityRecord } from '../types/mapTypes';
import type { MapLayerState } from '../types/mapTypes';
import styles from './EuropeBusinessMap.module.css';

interface CityNodeProps {
  city: MapCityRecord;
  isSelected: boolean;
  isHovered: boolean;
  isHub: boolean;
  layers: MapLayerState;
  showLabel?: boolean;
  onSelect: (city: MapCityRecord) => void;
  onHover: (city: MapCityRecord | null) => void;
}

export const CityNode = memo(function CityNode({
  city,
  isSelected,
  isHovered,
  isHub,
  layers,
  showLabel = true,
  onSelect,
  onHover,
}: CityNodeProps) {
  const active = isSelected || isHovered;
  const radius = isHub ? 2.2 : city.isMajorHub ? 1.7 : active ? 1.5 : 1.1;

  return (
    <g
      className={`${styles.cityNode} ${active ? styles.cityNodeActive : ''} ${isHub ? styles.cityNodeHub : ''} ${city.isMajorHub ? styles.cityNodeMajor : ''}`}
      transform={`translate(${city.mapX}, ${city.mapY})`}
      onClick={(e) => { e.stopPropagation(); onSelect(city); }}
      onMouseEnter={() => onHover(city)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(city); }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${city.name}, ${city.country}`}
    >
      {isHub && (
        <>
          <ellipse cx="0" cy="0" rx="8" ry="6" fill="url(#ebmHubGlow)" className={styles.hubAura} />
          <circle r="4.5" className={styles.hubRing} />
          <circle r="3.5" className={styles.hubRing2} />
        </>
      )}
      {(city.isMajorHub && !isHub) && <circle r="2.8" className={styles.cityRing} />}
      {active && <circle r="2.6" className={styles.cityGlow} />}
      <circle r={radius} className={styles.cityDot} filter="url(#ebmGlow)" />
      <circle r="0.5" className={styles.cityPulse} />
      {layers.companies && city.metrics.companies > 500 && (
        <circle r="1.8" className={styles.metricRingCompanies} />
      )}
      {layers.jobs && city.metrics.jobs > 200 && (
        <circle r="2.2" className={styles.metricRingJobs} />
      )}
      {layers.warehouses && city.metrics.warehouses > 15 && (
        <circle r="2.6" className={styles.metricRingWarehouses} />
      )}
      {showLabel && (active || isHub || city.isMajorHub) && (
        <text y={-3.2} textAnchor="middle" className={styles.cityLabel}>{city.name}</text>
      )}
    </g>
  );
});
