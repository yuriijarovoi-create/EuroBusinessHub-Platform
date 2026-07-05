import type { MapCountry } from '@shared/types';
import styles from '../EuropeMap.module.css';

interface MapCountryLayerProps {
  countries: MapCountry[];
  selectedCountryCode?: string;
  onCountrySelect?: (country: MapCountry) => void;
}

export function MapCountryLayer({
  countries,
  selectedCountryCode,
  onCountrySelect,
}: MapCountryLayerProps) {
  return (
    <g className={styles.countries}>
      {countries.map((country) => {
        const isHub = country.isHub;
        const isSelected = country.code === selectedCountryCode;

        return (
          <path
            key={country.id}
            d={country.mapPath}
            className={`${styles.country} ${isHub ? styles.countryHub : ''} ${isSelected ? styles.countrySelected : ''}`}
            onClick={() => onCountrySelect?.(country)}
            role="button"
            tabIndex={0}
            aria-label={country.name}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCountrySelect?.(country);
              }
            }}
          />
        );
      })}
    </g>
  );
}
