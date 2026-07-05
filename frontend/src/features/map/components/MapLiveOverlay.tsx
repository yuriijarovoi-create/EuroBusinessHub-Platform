import styles from '../EuropeMap.module.css';

interface MapLiveOverlayProps {
  label: string;
  stats?: { cities: number; routes: number };
}

export function MapLiveOverlay({ label, stats }: MapLiveOverlayProps) {
  return (
    <>
      <div className={styles.liveIndicator}>
        <span className={styles.liveDot} />
        {label}
      </div>
      {stats && (
        <div className={styles.mapStats}>
          <span>{stats.cities} Städte</span>
          <span className={styles.mapStatsSep}>·</span>
          <span>{stats.routes} Routen aktiv</span>
        </div>
      )}
    </>
  );
}
