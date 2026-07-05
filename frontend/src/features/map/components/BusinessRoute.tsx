import { memo } from 'react';
import type { TransportMode } from '../types/mapTypes';
import { RouteParticle } from './RouteParticle';
import styles from './EuropeBusinessMap.module.css';

const MODE_CLASS: Record<TransportMode, string> = {
  road: styles.routeRoad,
  rail: styles.routeRail,
  air: styles.routeAir,
  sea: styles.routeSea,
  river: styles.routeRiver,
};

interface BusinessRouteProps {
  path: string;
  mode: TransportMode;
  delay?: number;
}

export const BusinessRoute = memo(function BusinessRoute({
  path,
  mode,
  delay = 0,
}: BusinessRouteProps) {
  const dur = mode === 'air' ? 3.2 : mode === 'sea' ? 4 : 2.4;

  return (
    <g className={styles.routeGroup} aria-hidden filter="url(#routeGlow)">
      <path
        d={path}
        fill="none"
        strokeWidth={mode === 'air' ? 0.28 : 0.38}
        className={`${styles.routeLine} ${MODE_CLASS[mode]}`}
        style={{ animationDelay: `${delay}s` }}
      />
      <path
        d={path}
        fill="none"
        strokeWidth="0.15"
        className={`${styles.routeGlow} ${MODE_CLASS[mode]}`}
        style={{ animationDelay: `${delay}s` }}
      />
      <RouteParticle path={path} delay={delay} dur={dur} />
      <RouteParticle path={path} delay={delay + dur * 0.5} dur={dur} className={styles.particleAlt} />
      {mode === 'air' && (
        <g className={styles.airMarker}>
          <polygon points="-0.5,0 0.5,0 0,0.6" className={styles.planeIcon}>
            <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} rotate="auto" />
          </polygon>
        </g>
      )}
      {mode === 'sea' && (
        <g className={styles.seaMarker}>
          <path d="M-0.6,0.2 L0.6,0.2 L0,0.5 Z" className={styles.shipIcon}>
            <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
          </path>
        </g>
      )}
    </g>
  );
});
