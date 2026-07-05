import styles from '../EuropeMap.module.css';

interface RouteData {
  id: string;
  path: string;
  delay: number;
}

interface MapRoutesProps {
  routes: RouteData[];
}

export function MapRoutes({ routes }: MapRoutesProps) {
  return (
    <g className={styles.routes}>
      {routes.map((route) => (
        <g key={route.id}>
          <path
            d={route.path}
            fill="none"
            stroke="var(--color-map-route)"
            strokeWidth="0.35"
            strokeDasharray="2 3"
            className={styles.route}
            style={{ animationDelay: `${route.delay}s` }}
          />
          <circle r="0.6" fill="var(--color-accent)" className={styles.signal}>
            <animateMotion dur={`${3 + route.delay}s`} repeatCount="indefinite" path={route.path} />
          </circle>
        </g>
      ))}
    </g>
  );
}
