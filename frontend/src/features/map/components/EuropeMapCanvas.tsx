import type { City, MapCountry } from '@shared/types';
import type { MapRoute } from '@shared/types';
import { EuropeLandmass } from './EuropeLandmass';
import { MapCountryLayer } from './MapCountryLayer';
import { MapRoutes } from './MapRoutes';
import { MapNetworkLayer } from './MapNetworkLayer';
import { MapHub } from './MapHub';
import { MapCityNode } from './MapCityNode';
import { HUB } from '../data/europeGeo';
import styles from '../EuropeMap.module.css';

interface EuropeMapCanvasProps {
  transform: string;
  routes: MapRoute[];
  cities: City[];
  countries: MapCountry[];
  hubLabel: string;
  selectedCityId?: string;
  selectedCountryCode?: string;
  showLabels?: boolean;
  onCitySelect: (city: City) => void;
  onCountrySelect?: (country: MapCountry) => void;
  getCityAriaLabel: (city: City) => string;
  useNetworkLayer?: boolean;
}

export function EuropeMapCanvas({
  transform,
  routes,
  cities,
  countries,
  hubLabel,
  selectedCityId,
  selectedCountryCode,
  showLabels = true,
  onCitySelect,
  onCountrySelect,
  getCityAriaLabel,
  useNetworkLayer = false,
}: EuropeMapCanvasProps) {
  return (
    <svg viewBox="0 0 100 70" className={styles.mapSvg} role="img">
      <defs>
        <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-map-hub)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-map-hub)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="oceanGrad" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="var(--color-map-ocean)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(15 76 129 / 0.15)" stopOpacity="1" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="100" height="70" fill="url(#oceanGrad)" rx="2" />

      <g transform={transform}>
        <EuropeLandmass />
        <MapCountryLayer
          countries={countries}
          selectedCountryCode={selectedCountryCode}
          onCountrySelect={onCountrySelect}
        />
        {useNetworkLayer ? (
          <MapNetworkLayer routes={routes} />
        ) : (
          <MapRoutes routes={routes} />
        )}
        <MapHub label={hubLabel} />
        {cities.map((city) => (
          <MapCityNode
            key={city.id}
            city={city}
            isHub={city.id === HUB.id}
            isSelected={city.id === selectedCityId}
            showLabel={showLabels}
            onSelect={onCitySelect}
            ariaLabel={getCityAriaLabel(city)}
          />
        ))}
      </g>
    </svg>
  );
}
