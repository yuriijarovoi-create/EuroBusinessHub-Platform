import { memo } from 'react';
import { EUROPE_COASTLINE, EUROPE_COUNTRY_REGIONS } from '../data/europeCountriesGeo';
import type { MapCityRecord } from '../types/mapTypes';
import styles from './EuropeBusinessMap.module.css';

interface EuropeMapBackgroundProps {
  showNightLights?: boolean;
  cities?: MapCityRecord[];
}

export const EuropeMapBackground = memo(function EuropeMapBackground({
  showNightLights = true,
  cities = [],
}: EuropeMapBackgroundProps) {
  return (
    <g className={styles.background}>
      {EUROPE_COUNTRY_REGIONS.map((region) => (
        <path
          key={region.code}
          d={region.path}
          className={styles.countryFill}
          fill={region.fill}
        />
      ))}
      <path d={EUROPE_COASTLINE} className={styles.coastline} fill="none" />
      <rect className={styles.satelliteOverlay} x="0" y="0" width="100" height="70" />
      {showNightLights &&
        cities.map((city) => (
          <circle
            key={`light-${city.id}`}
            cx={city.mapX}
            cy={city.mapY}
            r={city.isMajorHub ? 0.35 : 0.2}
            className={styles.nightLight}
          />
        ))}
      <g className={styles.networkShimmer} aria-hidden>
        <circle cx="50" cy="35" r="45" className={styles.shimmerRing} />
      </g>
    </g>
  );
});
