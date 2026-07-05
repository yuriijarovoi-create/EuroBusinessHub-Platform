import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cities } from '@/data/cities';
import type { City } from '@shared/types';
import styles from './EuropeMap.module.css';

interface EuropeMapProps {
  selectedCityId?: string;
  onCitySelect?: (city: City) => void;
}

export function EuropeMap({ selectedCityId, onCitySelect }: EuropeMapProps) {
  const { t } = useTranslation('map');
  const navigate = useNavigate();

  const handleCityClick = (city: City) => {
    onCitySelect?.(city);
    navigate(`/workspace/${city.id}`);
  };

  return (
    <section className={styles.mapSection} id="map" aria-label={t('title')}>
      <header className={styles.header}>
        <h2>{t('title')}</h2>
        <p>{t('subtitle')}</p>
      </header>

      <div className={styles.mapContainer}>
        <svg
          viewBox="0 0 100 70"
          className={styles.mapSvg}
          role="img"
          aria-label={t('legend')}
        >
          {/* Simplified Europe landmass */}
          <rect x="0" y="0" width="100" height="70" fill="var(--color-map-ocean)" />
          <path
            d="M 30 15 Q 35 10 45 12 L 55 8 Q 65 6 72 12 L 78 18 Q 82 25 80 35
               L 75 45 Q 70 55 62 58 L 55 62 Q 48 65 42 60 L 35 55 Q 28 50 26 42
               L 24 35 Q 22 28 25 22 Z"
            fill="var(--color-map-land)"
            stroke="var(--color-map-border)"
            strokeWidth="0.3"
          />
          <path
            d="M 38 48 Q 42 52 48 54 L 52 58 Q 48 62 44 58 L 40 52 Z"
            fill="var(--color-map-land)"
            stroke="var(--color-map-border)"
            strokeWidth="0.2"
          />
          <path
            d="M 68 38 Q 74 36 78 40 L 80 48 Q 76 52 70 50 Z"
            fill="var(--color-map-land)"
            stroke="var(--color-map-border)"
            strokeWidth="0.2"
          />

          {cities.map((city) => {
            const isSelected = city.id === selectedCityId;
            return (
              <g
                key={city.id}
                className={styles.markerGroup}
                transform={`translate(${city.mapX}, ${city.mapY})`}
                onClick={() => handleCityClick(city)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCityClick(city);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${city.name}, ${t('businesses', { count: city.businesses })}`}
              >
                <circle
                  r={isSelected ? 2.8 : 2.2}
                  className={`${styles.marker} ${isSelected ? styles.markerActive : ''}`}
                />
                <text
                  y={-3.5}
                  textAnchor="middle"
                  className={styles.markerLabel}
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>

        <p className={styles.hint}>{t('zoomHint')}</p>
      </div>
    </section>
  );
}
