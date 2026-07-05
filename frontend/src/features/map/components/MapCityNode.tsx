import type { City } from '@shared/types';
import styles from '../EuropeMap.module.css';

interface MapCityNodeProps {
  city: City;
  isSelected: boolean;
  isHub: boolean;
  showLabel: boolean;
  onSelect: (city: City) => void;
  ariaLabel: string;
}

export function MapCityNode({
  city,
  isSelected,
  isHub,
  showLabel,
  onSelect,
  ariaLabel,
}: MapCityNodeProps) {
  if (isHub) return null;

  const radius = city.isMajorHub ? 2.4 : isSelected ? 2.6 : 2;

  return (
    <g
      className={styles.markerGroup}
      transform={`translate(${city.mapX}, ${city.mapY})`}
      onClick={() => onSelect(city)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(city);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      {city.isMajorHub && (
        <circle r="3.5" fill="none" stroke="var(--color-accent)" strokeWidth="0.2" className={styles.majorRing} />
      )}
      <circle
        r={radius}
        className={`${styles.marker} ${isSelected ? styles.markerActive : ''} ${city.isMajorHub ? styles.major : ''}`}
      />
      <circle r="1" fill="var(--color-accent-light)" className={styles.nodePulse} />
      {showLabel && (
        <text y={-3.2} textAnchor="middle" className={styles.markerLabel}>{city.name}</text>
      )}
    </g>
  );
}
