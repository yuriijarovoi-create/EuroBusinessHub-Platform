import type { MapRoute, BusinessRouteType } from '@shared/types';
import styles from '../InteractiveEuropeMap.module.css';

const ROUTE_CLASS: Record<BusinessRouteType, string> = {
  logistics: styles.routeLogistics,
  cargo: styles.routeCargo,
  truck: styles.routeTruck,
  railway: styles.routeRail,
  shipping: styles.routeShip,
  air_cargo: styles.routeAir,
};

interface MapNetworkLayerProps {
  routes: MapRoute[];
}

export function MapNetworkLayer({ routes }: MapNetworkLayerProps) {
  return (
    <g className={styles.network}>
      {routes.filter((r) => r.active).map((route) => (
        <g key={route.id}>
          <path
            d={route.path}
            fill="none"
            strokeWidth="0.4"
            strokeDasharray="2 3"
            className={`${styles.networkRoute} ${ROUTE_CLASS[route.type]}`}
            style={{ animationDelay: `${route.delay}s` }}
          />
          <circle r="0.55" className={styles.networkSignal}>
            <animateMotion dur={`${2.5 + route.delay}s`} repeatCount="indefinite" path={route.path} />
          </circle>
        </g>
      ))}
    </g>
  );
}
