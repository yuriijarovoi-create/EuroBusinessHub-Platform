import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { getMapLiveStats } from '../services/mapService';
import styles from '../InteractiveEuropeMap.module.css';

export function MapLiveStatsPanel() {
  const { t } = useTranslation('map');
  const stats = getMapLiveStats();

  return (
    <div className={styles.livePanel}>
      <span className={styles.livePanelTitle}>{t('live.title')}</span>
      <div className={styles.liveGrid}>
        {stats.map((stat) => (
          <div key={stat.id} className={styles.liveItem}>
            <AnimatedCounter value={stat.value} className={styles.liveValue} />
            <span className={styles.liveLabel}>{t(stat.labelKey)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
