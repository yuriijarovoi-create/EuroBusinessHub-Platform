import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MAP_VIEWBOX } from '../data/europeGeo';
import styles from './EuropeBusinessMap.module.css';

interface MapViewportProps {
  transform: string;
  children: ReactNode;
}

export const MapViewport = memo(function MapViewport({ transform, children }: MapViewportProps) {
  const { t } = useTranslation('map');

  return (
    <svg
      viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
      className={styles.svg}
      role="img"
      aria-label={t('a11y.mapViewport')}
    >
      <defs>
        <radialGradient id="ebmOcean" cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor="rgb(8 20 40)" stopOpacity="1" />
          <stop offset="60%" stopColor="rgb(4 10 22)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(2 4 10)" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="ebmHubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
          <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <filter id="ebmGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="routeGlow">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="url(#ebmOcean)" />
      <g transform={transform} className={styles.mapLayer}>
        {children}
      </g>
    </svg>
  );
});
